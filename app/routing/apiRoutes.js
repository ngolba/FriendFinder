const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')
const rimraf = require('rimraf')
const cloudinary = require('cloudinary');
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
const friendPath = path.join(__dirname, '../data/friends.js')
let currentUser = {name: '', image: '', responses: []}
let friends = []
fs.readFile(friendPath, 'utf8', (err, data) => {
    friends = JSON.parse(data);
})

const findMatch = (user, allUsers) => {
    let nonDuplicateUsers = allUsers.filter(x => (x.name != user.name && x.image != user.image))
    let matchScores = nonDuplicateUsers
        .map(u => (u.responses.map((score, question) => score >= user.responses[question] ? score - user.responses[question] : user.responses[question] - score))
            .reduce((a, b) => a + b))
    return nonDuplicateUsers[matchScores.indexOf(Math.min(...matchScores))]
}

router.post('/upload', upload.single('userInfo'), (req, res) => {
    let { userInfo: [username, userUrl] } = req.body;
    currentUser.name = username;
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, (result) => {
            currentUser.image = result.url;
            rimraf(path.join(__dirname, '../../uploads'), () => console.log('upload deleted'))
        })
    } else if (userUrl) currentUser.image = userUrl;
    else currentUser.image = stockImg;
})

router.post('/api/friends', (req, res) => {
    currentUser.responses = req.body.responses;
    let match = findMatch(currentUser, friends);
    friends.push(currentUser);
    fs.writeFile(friendPath, JSON.stringify(friends), 'utf8', err => {
        if (err) console.log(err)
    });
    res.send(match)
})

router.get('/api/friends', (req, res) => {
    res.sendFile(friendPath)
})


module.exports = router;