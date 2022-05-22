# consistent hashing

## why need it?

    - distribute requests/data efficiently and evenly across server

## how achieve it?

    n request/data to m servers
    1. serverIndex = hash(key) % m
        problem: when we add/remove a server we should move almost all request/data 
        if n = 4, m= 4 ,keys = [k1,k2,k3,k4],serverIndex=[0,1,2,3]
        hashResult = keys.forEach(hash(key)) => [ [k1],[k2],[k3],[k4]]
        1.1  add/remove a server index1 serverIndex = [0,1,3]
        hashResult =  keys.forEach(hash(key)) =>[[k1,k2],[k4],[k3]
        so the k2 move to serverIndex0, k4 move to serverIndex1
