const express = require('express');
const router = express.Router();
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')
const friendPath = path.join(__dirname, '../data/friends.js')

let friends = []
fs.readFile(friendPath, 'utf8', (err, data) => {
    friends = JSON.parse(data);
})

const findMatch  = (user, allUsers) => {
    let matchScores = allUsers.map(u => (u.scores.map((score, question) => score >= user.scores[question] ? score - user.scores[question]: user.scores[question] - score)).reduce((a, b) => a + b))
    let match = allUsers[matchScores.indexOf(Math.min(...matchScores))]
    return match;
}

// findMatch({user: 'user', scores: [1, 2, 3, 4, 5]}, [{user: 'user2', scores: [2, 2, 2, 2, 2]}, {user: 'user3', scores: [3, 3, 3, 3, 3]}, {user: 'user4', scores: [4, 4, 4, 4, 4]}])

router.post('/api/friends', (req, res) => {
    friends.push(req.body)
    fs.writeFile(friendPath, JSON.stringify(friends), 'utf8', err => {if (err) console.log (err)})
    console.log(friends);
})

router.get('/api/friends', (req, res) => {
    res.sendFile(friendPath)
})


module.exports = router;
