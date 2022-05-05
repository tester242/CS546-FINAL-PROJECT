const express = require('express');
const router = express.Router();
const data = require('../data');
const orderData = data.orders;
const userData = data.users;
const xss = require('xss');

// ROUTES //

// GET //
router.get('/', async (req, res) => {
    try {
        if (req.session.user) {
            const level = await userData.checkUserLevel(xss(req.body.username));
            if (level) {
                res.render('users/profile'); // User-view
            } else {
                res.render('users/orders'); // Admin-view
            }
        } else {
            res.render('users/login');
        }
    } catch (e) {
        return res.status(400).json(e);
    }
});

module.exports = router;