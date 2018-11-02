const express = require('express');
const router = express.Router();
const path = require('path');
const rimraf = require('rimraf')
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


const convertScores = (user) => user.responses = [...user.responses].map(x => x * 1)

const findMatch = (user, allUsers) => {
    return new Promise((resolve, reject) => {
        let scores = []
        let winner = {}
        allUsers.forEach((value, key) => {
            value.score = value.responses.map((score, i) =>
                Math.abs(user.responses[i] - score)).reduce((a, b) => a + b)
            scores.push(value.score)
            if (value.score === Math.min(...scores)) winner = value;
        })
        resolve(winner)
    })
}

const grabUsers = (userId) => {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * FROM users`;
        connection.query(queryString, (err, res) => {
            if (err) throw err;
            let allUsers = new Map(res.map(user => [user.id, user]))
            allUsers.forEach((value, key) => {
                convertScores(value)
            })
            let user = allUsers.get(userId);
            allUsers.delete(userId);
            resolve({
                user,
                allUsers
            })
        })
    })
}

const addUserData = (user) => {
    let {
        name,
        url,
        responses
    } = user;
    return new Promise((resolve, reject) => {
        let queryString = `INSERT INTO users (name, url, responses) VALUES ('${name}', '${url}', '${responses}');`
        connection.query(queryString, (err, res) => {
            if (err) throw err;
            resolve(res);
        })
    })
}

router.post('/upload', upload.single('userFile'), (req, res) => {
    return new Promise((resolve, reject) => {
            console.log(req.body)
            let user = req.body
            if (req.file) {
                cloudinary.uploader.upload(req.file.path, (result) => {
                    user.url = result.url;
                    resolve(user)
                    rimraf(path.join(__dirname, '../../uploads'), () => console.log('upload deleted'))
                })
            } else if (!user.url) {
                user.url = stockImg;
                resolve(user)
            } else {
                resolve(user)
            }
        }).then(res => addUserData(res))
        .then(res => grabUsers(res.insertId))
        .then(res => findMatch(res.user, res.allUsers))
        .then(winner =>  res.send(winner))
})

router.get('/api/friends', (req, res) => {
    // res.send(req.app.locals.Users)
})


module.exports = router;