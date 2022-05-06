/* Name: Anton Danylenko, Danielle Faustino, Kyle Henderson, Nicholas Whitt
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Group 17 Final Project
   This page will contain an outline of the users information, including their requests
   and commissions, their orders
*/

const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const xss = require('xss');




// HELPER FUNCTIONS //

// isAlphaNumeric function references StackOverflow
const isAlphaNumeric = function isAlphaNumeric(str) {
    let code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
}

const checkValidUsername = function checkValidUsername(str) {

    if (typeof str != 'string') throw `Error: Username must be a string.`;
    if (str.trim().length != str.length) throw 'Error: Username must not contain spaces.';
    if (str.trim().length < 4) throw `Error: Username must be at least 4 characters long.`;
    if (!isAlphaNumeric(str)) throw 'Error: Username must only contain alphanumeric characters.';
}

const checkValidPassword = function checkValidPassword(str) {
    if (typeof str != 'string') throw `Error: Password must be a string.`;
    if (str.trim().length != str.length) throw 'Error: Password must not contain spaces.';
    if (str.trim().length < 6) throw `Error: Password must be at least 6 characters long.`;
}

const checkValidInput = function checkValidInput(username, password) {
    if (!username || !password) throw 'Error: Username and password must be provided.'
    checkValidUsername(username);
    checkValidPassword(password);
}



// ROUTES //

// GET /
router.get('/', async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/private');
        } else {
            res.render('users/login', {title: "Login"});
        }
    } catch (e) {
        return res.status(400).json(e)
    }
});

// GET /signup
router.get('/signup', async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/private');
        } else {
            res.render('users/signup', {title: "Sign Up"});
        }
    } catch (e) {
        return res.status(400).json(e); 
    }
});

// POST /signup
router.post('/signup', async (req, res) => {
    try {
        checkValidInput(xss(req.body.username), xss(req.body.password));
    } catch (e) {
        return res.render('users/signup', {title: "Sign Up", error: e, errorExists: true});
    }

    try {
        const create = await usersData.createUser(xss(req.body.username), xss(req.body.password));
        if (create.userInserted) {
            res.redirect('/');
        }
    } catch (e) {
        return res.render('users/signup', {title: "Sign Up", error: e, errorExists: true});
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        checkValidInput(xss(body.username), xss(req.body.password));
    } catch (e) {
        return res.render('users/login', {title: "Login", error: e, errorExists: true});
    }

    try {
        const check = await usersData.checkUser(xss(req.body.username), xss(req.body.password));
        if (check.authenticated == true) {
            req.session.user = xss(req.body.username);
            res.cookie("AuthCookie", {user: xss(req.body.username)});
            res.redirect('/private');
        } else {
            res.render('users/login', {title: "Login", error: e, errorExists: true});
        }
    } catch (e) {
        res.render('users/login', {title: "Login", error: e, errorExists: true}); 
    }
});

// GET profile page
router.get('/private', async (req, res) => {
    res.render('users/private', {username: req.session.user});
});

// GET /logout
router.get('/logout', async (req, res) => {
    res.clearCookie("AuthCookie");
    req.session.destroy();
    res.render('users/logout', {title: "Logout"});
});

module.exports = router;