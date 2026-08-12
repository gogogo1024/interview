// Compatibility shim for `react-dom/server` default export.
// Some third-party packages import the server entry as a default export
// (e.g. `import ReactDOMServer from 'react-dom/server'`) which causes
// a runtime error when the upstream package only exposes named exports.
// This shim re-exports named exports from the real browser entry and
// also provides a default export object for compatibility.

export * from "react-dom/server.browser";

import * as _server from "react-dom/server.browser";

// Provide a cheap default export that proxies the named exports.
const serverDefault = _server || {};

export default serverDefault;
