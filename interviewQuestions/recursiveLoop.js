const person = {
    name: 'Adam',
    friends: [
        {
            name: 'John',
            friends: [
                {
                    name: 'William',
                    friends: [
                        {
                            name: 'Emma'
                        },
                    ]
                },
                {
                    name: 'Olivia',
                    friends: [
                        {
                            name: 'Michael',
                            friends: [
                                {
                                    name: 'Eve'
                                },
                            ]
                        },
                    ]
                },
            ]
        },
    ]
};

function getAllTheNames(person) {
    const names = [person.name];
    if (person.friends) {
        return names.concat(
            ...person.friends.map(getAllTheNames)
        )
    }
    return names;
}
function getAllTheNamesIteration(person) {
    let friends = person.friends;
    const result = [person.name];
    let friendsArray = friends;
    while (friendsArray && friendsArray.length > 0) {
        // 相当于一次次弹出第一个数组，直到friendsArray为空
        const element = friendsArray.shift();
        result.push(element.name);
        if (element.friends) {
            friendsArray = friendsArray.concat(element.friends);
        }
    }
    return result;
}
console.log(getAllTheNames(person));
console.log(getAllTheNamesIteration(person));
