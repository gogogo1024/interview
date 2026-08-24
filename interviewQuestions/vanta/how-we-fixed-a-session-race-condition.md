Vanta provides audit firms and managed service providers (MSPs) with a dedicated console that allows them to oversee their clients and deliver audit and management services effectively. Partners work with their customers within their Vanta instances, conducting audits or helping them set up and manage their security and compliance program. To access their customers seamlessly, our authentication flow allows users to safely work across their customers’ Vanta instances without having to manually reauthenticate each time.

Since our partners provide additional services to our customers, it’s imperative that they have uninterrupted access to their clients’ Vanta instances. So, when we received reports from our partners that they were unexpectedly logged out throughout the day, we knew that fixing this issue was a top priority.

When partners with substantial initial page load data attempted to access their customers’ Vanta instances, they would experience unexpected logouts. The high volume of concurrent network requests, combined with potential CPU or network limitations, triggered these forced logouts. The difference between our small test accounts and partners' data-rich environments initially prevented us from replicating the issue internally. Observing the bug with a partner allowed us to identify the root cause and begin working on a solution.

## Uncovering the root cause

With these clues, we had a hunch that something with our session authentication flows was amiss. Looking at our session and authentication code, we found a pull request made that roughly lined up with our first bug report. The change in question updated our custom idle session duration feature, setting rolling: true in our [express-session](https://www.npmjs.com/package/express-session) configuration. Enabling rolling: true allowed us to improve our custom middleware, decreasing session store writes by ~20%.

While this change helped improve the performance and reliability of our sessions, it also introduced a subtle race condition when partners attempted to access their client’s Vanta instances.

Our session management flow uses express-session, with user sessions tied to a connect.sid cookie. When a user authenticates or reauthenticates, the server generates a new session, and the response includes a Set-Cookie header to update the client's connect.sid cookie.

![](https://cdn.prod.website-files.com/64009032676f244c7bf002fd/686456925e88479077ad6267_AD_4nXfC_j2-DOvIj2dQku8n2j8Ud_q13i3uLlJXLWCKcXvxq79XHKZ2NihhMhw0G2qcxsxrFqLL26GQj0UQ19ARi3yqUf0e-8_QEiX7ohu7VDPcLFbLIaWC60tmwnLr5kFGHaRb7LMI-A.png)

The connect.sid cookie changes with our reauthentication flow but gets overwritten by an older request.

Crucially, *before* we enabled rolling: true, this cookie would be set infrequently, upon user action to access one of their customers (reauthentication) or initial login. Turning on rolling: true changed that. Now, *every* server request reset the session cookie via the Set-Cookie header—even when the session hadn't actually changed.

Here's where things got tricky: during a reauthentication, multiple in-flight requests could overlap. Some older requests would still be pending when the reauthentication completed and the new session was issued. When those older requests finally returned, they would overwrite the browser'sconnect.sidwith an outdated session ID.

As a result, the client would unknowingly use a stale session cookie, causing future requests to fail authentication and forcing the user back to the login page. With this understanding, we turned our focus to fixing the race condition.

![](https://cdn.prod.website-files.com/64009032676f244c7bf002fd/686456925e88479077ad626e_AD_4nXfUB_Bj_QW6_wzY8aMwfu0w1H_frf0yOLmXeypHRjABV6kgC2jX5HrUp3485W7EqbxWn74ocZlLT4QHobDsikNcUAej_WOGkLSqqxK3XtWjhTpfszJdDbEKneEj5Fw-j9Z63dN6ag.gif)

The connect.sid cookie changes with our reauthentication flow but gets overwritten by an older request.

## Investigating cookie management

We brainstormed how we could prevent the race condition of server requests overwriting the new cookie value from the reauthentication flow with the old cookie value from a parallel or in-flight request. We first started with looking at [ApolloClient](https://www.apollographql.com/docs/react), the library our React app uses to manage state when communicating with the server.

### ApolloClient built-in handling

Looking through our codebase, we found that we were already using ApolloClient's [stop](https://www.apollographql.com/docs/react/api/core/ApolloClient#stop) and [clearStore](https://www.apollographql.com/docs/react/api/core/ApolloClient#clearstore) methods in a different part of the app to stop in-flight requests. This initially seemed like a good way to prevent in-flight requests from “completing” and overwriting the new cookie value from the reauthentication flow.  

```javascript
/** New code */

// Cancel any in-flight requests to prevent the new cookie value being overwritten.
client.stop();
await client.clearStore();

/** Existing code */    
await reauthenticate(...);
...
```

However, with further testing, we were able to still hit the race condition if we throttled the network connection resulting in requests made *before* reauthentication to return right after the reauthentication, overwriting the cookie. This was confusing as the ApolloClient methods seemed to not be having the intended effect.

We dove into the ApolloClient source code to verify our understanding of stop and clearStore. It turned out that the original code that utilized stop and clearStore was actually not doing what we expected. The stop method [removes queries](https://github.com/apollographql/apollo-client/blob/cfb1ecdf60bf0f87b43358d4f048e10b480ceee9/src/core/QueryManager.ts#L1110) from the QueryManager. However, this means that subsequent calls to [stop](https://github.com/apollographql/apollo-client/blob/cfb1ecdf60bf0f87b43358d4f048e10b480ceee9/src/core/QueryManager.ts#L215) or [clearStore](https://github.com/apollographql/apollo-client/blob/cfb1ecdf60bf0f87b43358d4f048e10b480ceee9/src/core/QueryManager.ts#L874) to cancel the in-flight requests won't actually tell its listeners to abort the query because they’ve been detached.

With this finding, we removed stop, which would allow clearStore to correctly abort the in-flight requests.

```javascript
// Do not call \`client.stop()\` here as it will not abort in-flight requests and subsequent attempts to abort
// Cancel any in-flight requests to prevent the new cookie value being overwritten.
await client.clearStore();
await reauthenticate(...);
```

![](https://cdn.prod.website-files.com/64009032676f244c7bf002fd/686456925e88479077ad6271_AD_4nXfenasOa_Rd82mVkE3Mm_pMDg8O_Xrj-EkskC1UDF1elCyTUFlHVUeA8XvFspjNcPg-SgH7u2CbNN4_FRNX2mKkqvKdupKFALDmtWar1kuQc9J_kO1ghLBrRYDUSjoGhV6VpRVY.gif)

The reauthentication flow is initiated and in-flight requests are aborted

We thought the issue was fixed, however we found that we could still reproduce the race condition this time by throttling the CPU. We observed that throttling the CPU caused the React app to render slower and in batches. This meant that the reauthentication flow could be triggered *at the same time* as other requests, and the request wouldn’t get aborted with the clearStore call causing the cookie to be overwritten.

Essentially, mechanisms that cause network requests to be batched and parallelized could cause this error. Some examples include pages sequentially fetching all list items from a paginated endpoint, pages with polling, and pages powered by lots of network requests especially if the user’s CPU is slow.

## Key learnings

- **Get to the root cause:** Initial symptoms were misleading; understanding the interplay between cookies, network timing, and Express was essential
- **Evaluate all options carefully:** We considered client-side, server-side, and library upgrades before choosing the lowest-risk solution
- **Simple is better:** A targeted client-side isolation was far less risky than reworking session management or Apollo internals
- **Bias for action:** We solved the customer pain point quickly without taking on significant tech debt

If solving tricky real-world engineering challenges like this sounds exciting, we're hiring! [Check out open roles at Vanta.](https://www.vanta.com/company/careers#open-roles)

 <video controls=""><source src="https://cdn.prod.website-files.com/64009032676f24f376f002fc/663144d17ea4b705f2171c17_VantaAI_Final_V1-transcode.mp4"> <source src="https://cdn.prod.website-files.com/64009032676f24f376f002fc/663144d17ea4b705f2171c17_VantaAI_Final_V1-transcode.webm"></video>

| Access Review Stage | Content / Functionality |
| --- | --- |
| Across all stages | - Easily create and save a new access review at a point in time - View detailed audit evidence of historical access reviews |
| Setup access review procedures | - Define a global access review procedure that stakeholders can follow, ensuring consistency and mitigation of human error in reviews - Set your access review frequency (monthly, quarterly, etc.) and working period/deadlines |
| Consolidate account access data from systems | - Integrate systems using dozens of pre-built integrations, or “connectors”. System account and HRIS data is pulled into Vanta. - Upcoming integrations include Zoom and Intercom (account access), and Personio (HRIS) - Upload access files from non-integrated systems - View and select systems in-scope for the review |
| Review, approve, and deny user access | - Select the appropriate systems reviewer and due date - Get automatic notifications and reminders to systems reviewer of deadlines - Automatic flagging of “risky” employee accounts that have been terminated or switched departments - Intuitive interface to see all accounts with access, account accept/deny buttons, and notes section - Track progress of individual systems access reviews and see accounts that need to be removed or have access modified - Bulk sort, filter, and alter accounts based on account roles and employee title |
| Assign remediation tasks to system owners | - Built-in remediation workflow for reviewers to request access changes and for admin to view and manage requests - Optional task tracker integration to create tickets for any access changes and provide visibility to the status of tickets and remediation |
| Verify changes to access | - Focused view of accounts flagged for access changes for easy tracking and management - Automated evidence of remediation completion displayed for integrated systems - Manual evidence of remediation can be uploaded for non-integrated systems |
| Report and re-evaluate results | - Auditor can log into Vanta to see history of all completed access reviews - Internals can see status of reviews in progress and also historical review detail |