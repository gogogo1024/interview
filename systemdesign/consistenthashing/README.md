# consistent hashing

## why need it?

 distribute requests/data efficiently and evenly across server

## how achieve it?

    n request/data to m servers
    1. serverIndex = hash(key) % m
        problem: when we add/remove a server we should move almost all request/data 
        if n = 4, m= 4 ,keys = [k1,k2,k3,k4],serverIndex=[0,1,2,3]
        hashResult = keys.forEach(hash(key)) => [ [k1],[k2],[k3],[k4]]
        1.1  add/remove a server index1 serverIndex = [0,1,3]
        hashResult =  keys.forEach(hash(key)) =>[[k1,k2],[k4],[k3]
        so the k2 move to serverIndex0, k4 move to serverIndex1
    2. hash space and hash ring && hash server
        2.1 hash function f output range of Math.pow(2,160)-1 it constructs the hash ring
        2.2 same hash function f based server ip or name onto the ring
        2.3 same hash function f  hash the input key in the hash ring
        2.4 to determine which server is the key is stored on, go clockwise from the key position
         on the pre hash ring until a server is found
        problem: 1. keep Map servers and keys on to the ring using a uniformly distributed hash 
            function is impossible when add/remove a server
    3. virtual nodes (based on pre 2)
        server0 and server1 each have three  virtual nodes, do 2
        sever0 => server0_0,server0_1,server0_2
        sever1 => server1_0,server1_1,server1_2
        to find which server the input key1 is stored on, go clockwise to find the first virtual node server0_1,
        so the key1 is stored on the sever0
        more virtual nodes more balanced data distribution, the more spaces are needed to store data about the virtual nodes
