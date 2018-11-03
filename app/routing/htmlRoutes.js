const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/home.html')))

router.get('/survey', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/survey.html'))
})

router.get('*', (req, res) => res.redirect('/'))

module.exports = router;