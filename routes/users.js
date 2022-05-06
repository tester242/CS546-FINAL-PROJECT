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

function stringChecker(str, variableName){
    if(typeof str != 'string')throw `${variableName || 'provided variable'} is not a String`;
    if(str.trim().length==0)throw 'Strings can not be empty';
}

function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}

function emailChecker(email){
    stringChecker(email,'Email');
    if(email.indexOf('@')<=0||email.indexOf('.')<=2)throw 'Error: Email improperly formatted';
}

const checkValidUsername = function checkValidUsername(str) {
    if (!str) throw 'Error: Username must be provided.';
    if (typeof str != 'string') throw `Error: Username must be a string.`;
    if (str.indexOf(' ')!=-1) throw 'Error: Username must not contain spaces.';
    if (str.trim().length < 4) throw `Error: Username must be at least 4 characters long.`;
    if (!isAlphaNumeric(str)) throw 'Error: Username must only contain alphanumeric characters.';
}

const checkValidPassword = function checkValidPassword(str) {
    if (!str) throw 'Error: Password must be provided.';
    if (typeof str != 'string') throw `Error: Passwords must be a string.`;
    if (str.indexOf(' ')!=-1) throw 'Error: Passwords must not contain spaces.';
    if (str.trim().length < 6) throw `Error: Passwords must be at least 6 characters long. `+str;
}

const checkValidInput = function checkValidInput(username, password,) {
    if (!username || !password) throw 'Error: Username and password must be provided.';
    checkValidUsername(username);
    checkValidPassword(password);
}

const checkValidInputTotal = function checkValidInput(username, password, confirmPassword, firstName, lastName, email, pronouns, age, city, state) {
    if (!username || !password||!confirmPassword||!firstName||!lastName||!email||!pronouns||!age||!city||!state) throw 'Error: All Fields must be provided.';
    checkValidUsername(username);
    checkValidPassword(password);
    checkValidPassword(confirmPassword);

    if(password!==confirmPassword)throw 'Error: Password and Confirm Password do not match.';

    stringChecker(firstName,'First Name');
    stringChecker(lastName, 'Last Name');
    stringChecker(pronouns,'pronouns');
    stringChecker(city,'City');
    stringChecker(state,'State');

    numChecker(age,'age');

    emailChecker(email);
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
        checkValidInputTotal(xss(req.body.username), xss(req.body.password), xss(req.body.confirmPassword), xss(req.body.firstName), xss(req.body.lastName), 
        xss(req.body.email), xss(req.body.pronouns), xss(req.body.age),xss(req.body.city), xss(req.body.state));
    } catch (e) {
        return res.render('users/signup', {title: "Sign Up", error: e, errorExists: true});
    }

    try {
        const create = await usersData.createUser(xss(req.body.username), xss(req.body.password), xss(req.body.confirmPassword), xss(req.body.firstName), 
        xss(req.body.lastName), xss(req.body.email), xss(req.body.pronouns), xss(req.body.age),xss(req.body.city), xss(req.body.state));
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
        checkValidInput(xss(req.body.username), xss(req.body.password));
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
    try {
        const user=await usersData.getUser(req.session.user);
        res.render('users/profile', {username: req.session.user, firstName: user.firstName,
        lastName: user.lastName,email: user.email,pronouns: user.pronouns,age:user.age,city:user.city,state:user.state,
        favoritesCount:user.favoritesCount,favoritedArt:user.favoritedArt});
    } catch (error) {
        res.render('users/profile', {error: e, errorExists: true}); 
    }    
});

// GET /logout
router.get('/logout', async (req, res) => {
    res.clearCookie("AuthCookie");
    req.session.destroy();
    res.render('users/logout', {title: "Logout"});
});

module.exports = router;