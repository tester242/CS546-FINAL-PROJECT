const express = require('express');
const router = express.Router();
const data = require('../data');
const orderData = data.orders;
const userData = data.users;
const xss = require('xss');

function stringChecker(str, variableName){
    if(typeof str != 'string'){
        throw `${variableName || 'provided variable'} is not a String`;
    }
    if(str.trim().length==0){
        throw 'Strings can not be empty';
    }
}

function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}


function validateID(id, name){
    if(!id) throw 'must provide '+name;
    stringChecker(id,name);
    if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
}

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
            if (level) {
                res.render('users/profile',{loggedIn: true}); // User-view
            } else {
                res.render('users/orders',{loggedIn: true,isAdmin: true}); // Admin-view
            }
        } else {
            res.render('users/login',{loggedIn: true});
        }
    } catch (e) {
        res.status(400).json(e);

    }
});

// POST /
router.post('/', async (req,res) => {
    try {
        if (req.session.user) {
            validateOrder(xss(req.body.userID), xss(req.body.cartID), xss(req.body.total), xss(req.body.date));
            const create = await orderData.createOrder(xss(req.body.userID), xss(req.body.cartID), xss(req.body.total), xss(req.body.date));
            if (create.orderInserted) {
                res.redirect('./');
            }
        }
    } catch (e) {
        res.status(400);
        res.render('users/shoppingCart', {title: "400 Error", error: e, errorExists: true, loggedIn: req.session.user!=null});
    }
});

module.exports = router;