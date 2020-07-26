require('dotenv').config();
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const routes = require('./routes');
app.use(session({secret: process.env.SESSIONSECRET,
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false}));
app.use("/", routes);
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
app.set('views', './views');
app.set('view engine', 'pug');


app.listen(port, () => console.log(`Server started on port: ${port}`));