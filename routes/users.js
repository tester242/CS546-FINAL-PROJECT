/* Name: Danielle Faustino
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Lab 10
   Notes: Routes users.js
*/

const express = require('express');
const router = express.Router();
const data = require('../data');
const usersData = data.users;



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
    //const alphanumeric = new RegExp('/^[a-z0-9]+$/i');

    if (typeof str != 'string') throw `Error: Username must be a string.`;
    if (str.trim().length != str.length) throw 'Error: Username must not contain spaces.';
    if (str.trim().length < 4) throw `Error: Username must be at least 4 characters long.`;
    //if (!alphanumeric.test(str)) 
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
            res.render('users/login');
        }
    } catch (e) {
        return res.status(400).json(e); // NOT SURE IF CORRECT ERROR
    }
});

// GET /signup
router.get('/signup', async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/private');
        } else {
            res.render('users/signup');
        }
    } catch (e) {
        return res.status(400).json(e); // NOT SURE IF CORRECT ERROR
    }
});

// POST /signup
router.post('/signup', async (req, res) => {
    try {
        checkValidInput(req.body.username, req.body.password);
    } catch (e) {
        //console.log(e)
        return res.render('users/signup', {error: e, errorExists: true});
    }

    try {
        const create = await usersData.createUser(req.body.username, req.body.password);
        if (create.userInserted) {
            res.redirect('/');
        }
    } catch (e) {
        return res.render('users/signup', {error: e, errorExists: true});
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        checkValidInput(req.body.username, req.body.password);
    } catch (e) {
        return res.render('users/login', {error: e, errorExists: true});
    }

    try {
        const check = await usersData.checkUser(req.body.username, req.body.password);
        //console.log(check)
        if (check.authenticated == true) {
            req.session.user = req.body.username;
            res.cookie("AuthCookie", {user: req.body.username});
            res.redirect('/private');
        } else {
            res.render('users/login', {error: e, errorExists: true});
        }
    } catch (e) {
        //console.log(e)
        res.render('users/login', {error: e, errorExists: true}); // NOT SURE IF CORRECT ERROR
    }
});

// GET /private
router.get('/private', async (req, res) => {
    //console.log(req.session.user)
    res.render('users/private', {username: req.session.user});
});

// GET /logout
router.get('/logout', async (req, res) => {
    res.clearCookie("AuthCookie");
    req.session.destroy();
    res.render('users/logout');
});

module.exports = router;