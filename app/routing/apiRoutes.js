const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')
const rimraf = require('rimraf')
const cloudinary = require('cloudinary');
const session = require('express-session');
const redis = require("redis");
const RedisStore = require('connect-redis')(session);

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
// function User(id, name, image, responses) {id, name, image, responses}
// let currentUser = {name: '', image: '', responses: []}
// let friends = []
// fs.readFile(friendPath, 'utf8', (err, data) => {
//     friends = JSON.parse(data);
// })


const findMatch = (user, allUsers) => {
    let nonDuplicateUsers = allUsers.filter(x => (x.name != user.name && x.image != user.image))
    let matchScores = nonDuplicateUsers
        .map(u => (u.responses.map((score, question) => score >= user.responses[question] ? score - user.responses[question] : user.responses[question] - score))
            .reduce((a, b) => a + b))
    return nonDuplicateUsers[matchScores.indexOf(Math.min(...matchScores))]
}

router.post('/upload', upload.single('userInfo'), (req, res) => {
    let { userInfo: [username, userUrl] } = req.body;
    req.session.user = {id: req.session.id, name: username}
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, (result) => {
            req.session.user.image = result.url;
            console.log('1', req.session)
            req.session.save(()=> console.log('saved'))
            rimraf(path.join(__dirname, '../../uploads'), () => console.log('upload deleted'))
        })
    } else if (userUrl) req.session.user.image = userUrl;
    else req.session.user.image = stockImg;
})

router.post('/api/friends', (req, res) => {
    req.session.reload(() => console.log('reloaded'))
    console.log('2', req.session)
    console.log(req.body)
    req.session.user.responses = req.body.responses;
    let match = findMatch(req.session.user, req.app.locals.Users);
    req.app.locals.Users.push(req.session.user);
    fs.writeFile(friendPath, JSON.stringify(req.app.locals.Users), 'utf8', err => {
        if (err) console.log(err)
    });
    res.send(match)
})

router.get('/api/friends', (req, res) => {
    res.send(req.app.locals.Users)
})


module.exports = router;