const express = require('express');
const router = express.Router();
const path = require('path');
const rimraf = require('rimraf')
const bodyParser = require('body-parser')
// router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: false
}));
const cloudinary = require('cloudinary');
const connection = require('../config/connection')
require('dotenv').config()
cloudinary.config({
    cloud_name: 'nihilistff',
    api_key: process.env.cloudinary_key,
    api_secret: process.env.cloudinary_secret
})
const multer = require('multer')
const upload = multer({
    dest: 'uploads/'
});
const stockImg = 'https://via.placeholder.com/300'

 
// parse various different custom JSON types as JSON
router.use(bodyParser.json({ type: 'application/*+json' }))
 
// parse some custom thing into a Buffer
router.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
 
// parse an HTML body into a string
router.use(bodyParser.text({ type: 'text/html' }))

const sortUsers = (users) => {
    return new Promise((resolve, reject) => {
        let userMap = new Map(users.res.map(user => [user.id, user]))

        userMap.forEach((value, key, map) => {
            value.responses = [...value.responses].map(x => x * 1)
        })

        let currentUser = userMap.get(users.userId)
        userMap.delete(users.userId)
        let scores = []

        userMap.forEach((value, key, map) => {
            value.score = value.responses.map((x, i, a) =>
                    Math.abs(currentUser.responses[i] - x))
                .reduce((a, b) => a + b);
            scores.push(value)
        })
        scores.sort((a, b) => a - b)
        resolve(scores[0])
    })
}


const grabUsers = (userId) => {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * FROM users`;
        connection.query(queryString, (err, res) => {
            if (err) throw err;
            resolve({
                userId,
                res
            })
        })
    })
}

const addUserData = (user) => {
    return new Promise((resolve, reject) => {
        let {
            name,
            url,
            responses
        } = user;
        let queryString = `INSERT INTO users (name, url, responses) VALUES ('${name}', '${url}', '${responses}');`
        connection.query(queryString, (err, res) => {
            if (err) throw err;
            resolve(res);
        })
    })
}

const setUserImage = (req) => {
    return new Promise((resolve, reject) => {
        let user = req.body;
        if (req.result) {
            user.url = req.result.url
            resolve(user)
        } else if (!user.url.length) {
            user.url += stockImg;
            resolve(user)
        } else resolve(user)
    })
}

// const send = (winner) => {
//     return new Promise((resolve, reject) => {
//         res.type('html');
//         resolve(res.send(winner.body))
//     })
// }

const initialPost = (req) => {
    return new Promise((resolve, reject) => {
        if (Object.keys(req.body).length < 5)(setTimeout(() => {
            return
        }, 500))
        else resolve(req)
    })
}


const begin = (req) => {
    return new Promise((resolve, reject) => {
        if (req.file) {
            cloudinary.uploader.upload(req.file.path, (result) => {
                req.body.url = result.url;
                rimraf(path.join(__dirname, '../../uploads'), () => console.log('upload deleted'))
                resolve(req)
            })
        } else resolve(req)
    })
}

router.post('/upload', upload.single('userFile'), (req, res, next) => {
    res.type('.html');   
    initialPost(req)
        .then(req => begin(req))
        .then(req => setUserImage(req))
        .then(req => addUserData(req))
        .then(res => grabUsers(res.insertId))
        .then(users => sortUsers(users))
        .then(winner => res.send(winner))
})

router.get('/api/friends', (req, res) => {
    // res.send(req.app.locals.Users)
})


module.exports = router;