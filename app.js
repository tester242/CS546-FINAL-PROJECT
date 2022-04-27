/* Name: Anton Danylenko, Danielle Faustino, Kyle Henderson, Nicholas Whitt
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Group 17 Final Project
*/

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const configRoutes = require('./routes');
app.use(cookieParser());

const static = express.static(__dirname + '/public');
app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.use(
    session({
        name: 'ProjectSession',
        secret: 'some secret string!',
        resave: false,
        saveUninitialized: true
    })
);

app.use('/private', (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    } else {
        next();
    }
});

app.use(async (req, res, next) => {
    let currentTimestamp = new Date().toUTCString();
    let isAuthorized = req.cookies.AuthCookie ? "(Authenticated User)" : "(Non-Authenticated User)";

    console.log(`[${currentTimestamp}]: ${req.method} ${req.originalUrl} ${isAuthorized}`);
    next();
});

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});