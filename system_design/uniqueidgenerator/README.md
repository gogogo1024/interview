design a unique id generator in distribute systems
requirements
  - unique and sortable
  - numerical only
  - fit into 64-bit
  - order by time
  - generate over 10,000 unique IDs per second
design
  - multi-master replication
1,3,5... to server1 and 2,4,6,... to server2
 problem: 
      1. can't go up with time across multiple servers.
      2. hard to scale with multiple data centers
  - twitter snowflake approach
1bit
41bits
5bits
5bits
12bits
sign 
timestamp 
datacenterID 
machineID
sequenceNumber
always be 0, it can potentially be used to distinguish between signed and unsigned numbers 

Milliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 years
2^5 =32 datacenters 
2^5 = 32 machines per datacenter
sequenceNumber: increment by 1,default 0, 

drawback :
    - clock synchronization: the time may not be the same in different machine 
    -  adjust:for low concurrency and long-term we should need fewer sequenceNumber and more timestamp bits
    -  high availability
