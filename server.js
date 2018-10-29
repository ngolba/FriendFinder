const htmlRouting = require('./app/routing/htmlRoutes')
const apiRouting = require('./app/routing/apiRoutes')
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon')
const app = express();
const PORT = process.env.PORT || 3000;
const redis = require("redis");
let client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.locals.Users = [{"name":"Nathan","image":"https://ngolba.github.io/Portfolio/assets/images/headShot.png","responses":["1","4","3","3","5","5","5","4","3","4"]}]

app.use(session({cookie: {secure: false, httpOnly: false}, secret: 'nffnffnff', resave: true, saveUninitialized: true, store: new RedisStore({client : client, url: 'redis-19847.c114.us-east-1-4.ec2.cloud.redislabs.com:19847'})}))
app.use(favicon(path.join(__dirname, 'app', 'data', 'favicon.ico')))
app.use('/', apiRouting);
app.use('/', htmlRouting);

app.listen(PORT, () => console.log(`App is listening on PORT ${PORT}`))