const express = require('express');
const router = express.Router();
const data = require('../data');
const commissionData = data.commissions;
const userData = data.users;
const xss = require('xss');

const commissionFields = ['id', 'price'];

function validate(att, field) {
    if (!field) throw 'Error: Must provide a field to check.';
    if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
    if (!(field in requestFields)) throw `Error: ${field} is an invalid field.`;
    if (!att) throw `Error: ${field} needs to be a valid value.`;
    if (field === 'id') {
        if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
        att = att.trim();
        if (att.length == 0) throw `Error: ${field} cannot be an empty string.`;
        if (!ObjectId.isValid(att)) throw 'Error: commissionID is not a valid Object ID.';
    }
    if (field === 'price') {
        if (typeof att !== 'number') throw `Error: ${field} must be a number.`;
        if (att < 0) throw `Error: ${field} cannot be less than 0.`;
    }
}

function validateCommission(request, price) {
    validate(request, 'id');
    validate(price, 'price');
}

// ROUTES //

// GET /commissions
router.get('/', async (req,res) => {
    try {
        if (req.session.user) {
            const level = await userData.checkUserLevel(xss(req.session.user));
            if (level) {
                res.render('users/requestForm', {title: "Request Commission", loggedIn: true});
            } else {
                res.render('users/commissions', {title: "Active Commissions", loggedIn: true,isAdmin:true});
            }
        }
    } catch (e) {
        return res.status(400).json(e);
    }
});

// v Necessary? v
// POST /commissions
// router.post('/', async (req,res) => {
//     try {
//         validateCommission(xss(req.body.requestID), xss(req.body.price));
//     } catch (e) {
//         return res.render('users/requestForm', {error: e, errorExists: true});
//     }
// });
// ^            ^
module.exports = router;