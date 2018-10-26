const htmlRouting = require('./app/routing/htmlRoutes')
const apiRouting = require('./app/routing/apiRoutes')
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', apiRouting);
app.use('/', htmlRouting);


app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`))