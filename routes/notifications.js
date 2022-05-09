const express = require('express');
const router = express.Router();
const data = require('../data');
const notifData = data.notifications;
const userData = data.users;
const xss = require('xss');

// Start StackOverFlow isValidDate
function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};
// End StackOverFlow isValidDate

function validateOrder(userID, cartID, total, date) {
    validateID(userID.toString(), 'userid');
    validateID(cartID.toString(), 'cartid');
    numChecker(total, 'total');
    if (!isValidDate(date)) throw 'Error: date is not a valid date string.';
}

// ROUTES //

// GET /
router.get('/', async (req, res) => {
    try {
        if (req.session.user) {
            const level = await userData.checkUserLevel(xss(req.session.user));
            const lister= await notifData.getAll();
            if (level) {
                res.render('users/profile',{loggedIn: true}); // User-view
            } else {
                res.render('users/notifications',{loggedIn: true,isAdmin: true,notifications:lister,notifications:true}); // Admin-view
            }
        } else {
            res.render('users/login',{loggedIn: true});
        }
    } catch (e) {
        res.status(400).json(e);

    }
});
module.exports = router;