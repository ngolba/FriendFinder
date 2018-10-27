const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'nihilistff',
    api_key: process.env.cloudinary_key,
    api_secret: process.env.cloudinary_secret
})
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' });
const friendPath = path.join(__dirname, '../data/friends.js')

let friends = []
fs.readFile(friendPath, 'utf8', (err, data) => {
    friends = JSON.parse(data);
})

const findMatch = (user, allUsers) => {
    let nonDuplicateUsers = allUsers.filter(x => (x.name != user.name && x.photo != user.photo ))
    let matchScores = nonDuplicateUsers
        .map(u => (u.responses.map((score, question) => score >= user.responses[question] ? score - user.responses[question] : user.responses[question] - score))
            .reduce((a, b) => a + b))
    return nonDuplicateUsers[matchScores.indexOf(Math.min(...matchScores))]
}

router.post('/api/imageProcessing', upload.single('userUpload'), (req, res) => {
    console.log(req.file)
    cloudinary.uploader.upload(req.file.path, (result) => console.log(result))
})

router.post('/api/friends', (req, res) => {
    let match = findMatch(req.body, friends);
    friends.push(req.body);
    fs.writeFile(friendPath, JSON.stringify(friends), 'utf8', err => {
        if (err) console.log(err)
    });
    res.send(match)
    // console.log(friends);
})

router.get('/api/friends', (req, res) => {
    res.sendFile(friendPath)
})


module.exports = router;