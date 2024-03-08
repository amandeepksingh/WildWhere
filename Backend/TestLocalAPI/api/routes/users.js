const express = require('express')

const users = express();

users.get('/', (req, res, next) => {
    const user = {
        name: req.body.name,
        email: req.body.email,
        radius: req.body.radius,
        notification: req.body.notification,
        bio: req.body.bio
    }
    res.status(200).json({
        user: user
    })
});



module.exports = users;