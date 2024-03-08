const bodyParser = require('body-parser');
const express = require('express')

const posts = express();

posts.post('/add', (req, res, next) => {
    const post = {
        author: req.body.author,
        image: req.body.image,
        species: req.body.species,
        count: req.body.count,
        additionalComments: req.body.additionalComments,
        coordinate: req.body.coordinate
    }
    res.status(200).json({
        post: post
    })
});

module.exports = posts;