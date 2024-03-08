const express = require('express')

const router = express();

const posts = require('./routes/posts');
const users = require('./routes/users');
const dbTesting = require('./routes/dbTesting');

router.use('/posts', posts);
router.use('/users', users);
router.use('/dbTesting', dbTesting);

router.use((res, req, next) => {
    req.header('Access-Control-Allow-Origin', '*') //TODO change * to the site that should have access. Currently allows any
    req.header('Access-Control-Allow-Headers', '*')
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST') //TODO add all the other methods we need for this
        return res.status(200).json({})
    }
});

router.use((req, res, next) => {
    const error = new Error('Not found');
    error.status(404); //404 = not found error
    next(error);
});

router.use((error, req, res, next) => {
    res.status(error.status || 500); //goes to 500 if not already defined 
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = router;