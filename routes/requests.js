const express = require('express');
const router = express.Router();
const data = require('../data');
const requestData = data.requests;
const userData = data.users;
const xss = require('xss');


const requestFields = ['id', 'title', 'desc'];

function validate(att, field) {
    if (!field) throw 'Error: Must provide a field to check.';
    if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
    if (!(field in requestFields)) throw `Error: ${field} is an invalid field.`;
    if (!att) throw `Error: ${field} needs to be a valid value.`;
    if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
    att = att.trim();
    if (att.length == 0) {
        if (field === 'id') throw `Error: ${field} cannot be an empty string.`;
        if (field === 'title'||field === 'description') throw `Error: Please provide a ${field}`;
    }
    if (field === 'id' && !ObjectId.isValid(att)) throw 'Error: userID is not a valid Object ID.';
}

function validateRequest(id, title, desc) {
    validate(id, 'id');
    validate(title, 'title');
    validate(desc, 'description');
}
// ROUTES //

// GET /requests
router.get('/', async (req,res) => {
    try {
        if (req.session.user) {
            const level = await userData.checkUserLevel(req.session.user);
            if (level) {
                res.render('users/requestForm',{loggedIn: true}); // User-view
            } else {
                res.render('users/requests',{loggedIn: true}); // Admin-view
            }
        } else {
            res.render('users/login');
        }
    } catch (e) {
        return res.status(400).json(e);
    }
});

// POST /requests
router.post('/', async (req,res) => {
    try {
        validateRequest(xss(req.body.id), xss(req.body.title), xss(req.body.description));
    } catch (e) {
        return res.render('users/requestForm', {error: e, errorExists: true,loggedIn: req.session.user!=null});
    }

    try {
        const create = await requestData.createRequest(xss(req.body.id), xss(req.body.title), xss(req.body.description));
        if (create.requestInserted) {
            res.redirect('users/profile');
        }
    } catch (e) {
        return res.render('users/requestForm', {error: e, errorExists: true,loggedIn: req.session.user!=null});
    }
});

module.exports = router;