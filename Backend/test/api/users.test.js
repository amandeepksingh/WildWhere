const users = require('../../api/routes/users.js');

test('createUser', () => {
    users.deleteUser() //wipe userDB before test
    req = {}
    req.body = {"username": "Johno"}
    res = {}
    result = users.createUser(req,res)
})