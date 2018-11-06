const express = require('express');
const router = express.Router();
const path = require('path');
const rimraf = require('rimraf')
const bodyParser = require('body-parser')
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

router.use(bodyParser.json({ type: 'application/*+json' }))
router.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
router.use(bodyParser.text({ type: 'text/html' }))

const sortUsers = (users) => {
    return new Promise((resolve, reject) => {
        let userMap = new Map(users.res.map(user => [user.id, user]))

        userMap.forEach((value, key, map) => {
            value.responses = [...value.responses].map(x => x * 1)
        })
        let scores = []

        userMap.forEach((value, key, map) => {
            value.score = value.responses.map((x, i, a) =>
                    Math.abs(users.currentUser.responses[i] - x))
                .reduce((a, b) => a + b);
            scores.push(value)
        })
        scores.sort((a, b) => (a.score - b.score))
        resolve(scores[0])
    })
}


const grabUsers = (currentUser) => {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * FROM users`;
        connection.query(queryString, (err, res) => {
            if (err) throw err;
            resolve({
                currentUser,
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

const begin = (req) => {
    return new Promise((resolve, reject) => {
        if (req.file) {
            cloudinary.uploader.upload(req.file.path, (result) => {
                req.body.url = result.url;
                resolve(req)
            })
        } else resolve(req)
    })
}

const processUser = (req) => {
    begin(req)
        .then((req) => setUserImage(req))
        .then((user) => addUserData(user))
        .then((res) => console.log('done'))
}

router.post('/upload', upload.single('userFile'), (req, res, next) => {
    res.type('.html'); 
    console.log('post')  
    let currentUser = {responses: req.body.responses}
    grabUsers(currentUser)
        .then((users) => sortUsers(users))
        .then((winner) => {
            res.send(`<p id="surveyMatchWinner">${JSON.stringify(winner)}</p>`)
            processUser(req)
        })
})

module.exports = router;