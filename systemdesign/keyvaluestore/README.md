# key value store CAP theory

## data partition

   1. Distribute data across multiple servers evenly.
   2. Minimize data movement when nodes are added or removed.
   Consistent hashing can solve the upper problem

## data replication

   replicas are placed in distinct data centers, and data centers are connected through high-speed networks.

## consistent

    Quorum consensus  W + R > N； write,read, n replicas
    R = 1 and W = N , for a fast read
    R = N and W = 1 , for a fast w
    W + R > N ,strong consistency is guaranteed
    W + R < = N ,strong consistency is not  guaranteed

## consistency models

   strong consistency: any read returns  when a value corresponding to the result of the most updated write data item
   weak consistency: subsequent read may not see the most updated data
   eventual consistency: based on weak consistency ,given enough time all replicates are consistent

## inconsistency resolution: version

      #  todo

## handling failures

   gossip protocol
      - each node maintains a node membership list, which contains member IDs and heartbeat counters
      - each node periodically increments its heartbeat counter
      - each node periodically send heartbeats to a set of random node
      - once nodes receive heartbeats, membership list is updated to the latest info
      - if the heartbeat has not increased for more than predefined periods,the member is considered as offline