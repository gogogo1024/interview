

design a unique id generator in distribute systemsdesign a unique id generator in distribute systemsdesign a unique id generator in distribute systems​​


### requirements​



unique and sortableunique and sortableunique and sortable​​



numerical onlynumerical onlynumerical only​​



fit into 64-bitfit into 64-bitfit into 64-bit​​



order by timeorder by timeorder by time​​



generate over 10,000 unique IDs per secondgenerate over 10,000 unique IDs per secondgenerate over 10,000 unique IDs per second​​


### design​



multi-master replicationmulti-master replicationmulti-master replication​​



1,3,5... to server1 and 2,4,6,... to server21,3,5... to server1 and 2,4,6,... to server21,3,5... to server1 and 2,4,6,... to server2​​



 problem:  problem:  problem: ​​



can't go up with time across multiple servers.can't go up with time across multiple servers.can't go up with time across multiple servers.​​



hard to scale with multiple data centershard to scale with multiple data centershard to scale with multiple data centers​​



twitter snowflake approachtwitter snowflake approachtwitter snowflake approach​​



​
1bit​
	
41bits​
	
5bits​
	
5bits​
	
12bits​


sign ​
	
timestamp ​
	
datacenterID ​
	
machineID​
	
sequenceNumber​


always be 0, it can potentially be used to distinguish between signed and unsigned numbers ​
​
	
Milliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 years​
	
2^5 =32 datacenters ​
	
2^5 = 32 machines per datacenter​
	
sequenceNumber: increment by 1,default 0, ​

​1bit1bit1bit​​41bits41bits41bits​​5bits5bits5bits​​5bits5bits5bits​​12bits12bits12bits​​sign sign sign ​​timestamptimestamptimestamp  ​​datacenterIDdatacenterIDdatacenterID  ​​machineIDmachineIDmachineID​​sequenceNumbersequenceNumbersequenceNumber​​always be 0, it can potentially be used to distinguish between signed and unsigned numbers always be 0, it can potentially be used to distinguish between signed and unsigned numbers always be 0, it can potentially be used to distinguish between signed and unsigned numbers ​​​​Milliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 yearsMilliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 yearsMilliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 years​​2^5 =32 datacenters 2^5 =32 datacenters 2^5 =32 datacenters ​​2^5 = 32 machines per datacenter2^5 = 32 machines per datacenter2^5 = 32 machines per datacenter​​sequenceNumber: increment by 1,default 0, sequenceNumber: increment by 1,default 0, sequenceNumber: increment by 1,default 0, ​​​​



1bit1bit1bit​​



41bits41bits41bits​​



5bits5bits5bits​​



5bits5bits5bits​​



12bits12bits12bits​​



sign sign sign ​​



timestamptimestamptimestamp  ​​



datacenterIDdatacenterIDdatacenterID  ​​



machineIDmachineIDmachineID​​



sequenceNumbersequenceNumbersequenceNumber​​



always be 0, it can potentially be used to distinguish between signed and unsigned numbers always be 0, it can potentially be used to distinguish between signed and unsigned numbers always be 0, it can potentially be used to distinguish between signed and unsigned numbers ​​



​​



Milliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 yearsMilliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 yearsMilliseconds since the epoch(twitter snowflake default epoch 1288834974657) or custom epoch,2^41-1 almost always 69 years​​



2^5 =32 datacenters 2^5 =32 datacenters 2^5 =32 datacenters ​​



2^5 = 32 machines per datacenter2^5 = 32 machines per datacenter2^5 = 32 machines per datacenter​​



sequenceNumber: increment by 1,default 0, sequenceNumber: increment by 1,default 0, sequenceNumber: increment by 1,default 0, ​​



drawback :drawback :drawback :​​



clock synchronization: the time may not be the same in different machine clock synchronization: the time may not be the same in different machine clock synchronization: the time may not be the same in different machine ​​



 adjust:for low concurrency and long-term we should need fewer sequenceNumber and more timestamp bits adjust:for low concurrency and long-term we should need fewer sequenceNumber and more timestamp bits adjust:for low concurrency and long-term we should need fewer sequenceNumber and more timestamp bits​​



 high availability high availability high availability​​



​​

