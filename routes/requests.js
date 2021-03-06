const express = require('express');
const router = express.Router();
const data = require('../data');
const requestData = data.requests;
const userData = data.users;
const notifData= data.notifications;
const commissionData = data.commissions;
const xss = require('xss');


function validateID(id, name){
    if(!id) throw 'must provide an id';
    stringChecker(id,name);
    if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
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

function zipChecker(zip){
    return isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
}

function emailChecker(email){
    stringChecker(email,'Email');
    if(email.indexOf('@')<=0||email.indexOf('.')<=2)throw 'Error: Email improperly formatted';
}

// function validate(att, field) {
//     if (!field) throw 'Error: Must provide a field to check.';
//     if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
//     if (!(field in requestFields)) throw `Error: ${field} is an invalid field.`;
//     if (!att) throw `Error: ${field} needs to be a valid value.`;
//     if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
//     att = att.trim();
//     if (att.length == 0) {
//         if (field === 'id') throw `Error: ${field} cannot be an empty string.`;
//         if (field === 'title'||field === 'description') throw `Error: Please provide a ${field}`;
//     }
//     if (field === 'id' && !ObjectId.isValid(att)) throw 'Error: userID is not a valid Object ID.';
// }

function validateRequest(name, email, address, city, state, zip, title, description) {
    if(!name||!email||!address||!city||!state||!zip||!title||!description)throw 'Error: all fields must be filled out';
    stringChecker(name,"name");
    stringChecker(address,"address");
    stringChecker(city,"city");
    stringChecker(state,"state");
    stringChecker(zip,"zip");
    stringChecker(title,"title");
    stringChecker(description,"description");

    emailChecker(email);

    if(!zipChecker(zip))throw 'Error: not a valid zip';
}
// ROUTES //

// GET /requests
router.get('/', async (req,res) => {
    try {
        if (req.session.user) {
            const listing= await notifData.getAll();
            const level = await userData.checkUserLevel(req.session.user);
            if (level) {
                res.render('users/requestForm',{title: "Request Commission Form", loggedIn: true}); // User-view
            } else {
                const lister=await requestData.getAll();
                res.render('users/requests',{title: "Pending Requests", requests:lister,loggedIn: true,isAdmin:true,notifications:listing}); // Admin-view
            }
        } else {
            res.render("users/login", {title: "Please Log In To Put In A Commission"});
        }
    } catch (e) {
        return res.status(400).json(e);
    }
});

// POST /requests
router.post('/', async (req,res) => {
    if(req.session.user){
        try {
            const level = await userData.checkUserLevel(req.session.user);
            if (level) {
                validateRequest(xss(req.body.name), xss(req.body.email), xss(req.body.address), xss(req.body.city), xss(req.body.state)
                , xss(req.body.zip), xss(req.body.title), xss(req.body.description));
                const user=await userData.getUser(req.session.user);
                const create = await requestData.createRequest(user._id,xss(req.body.name), xss(req.body.email), xss(req.body.address), xss(req.body.city), xss(req.body.state)
                , xss(req.body.zip), xss(req.body.title), xss(req.body.description));
                if (create.requestInserted) {
                    res.redirect('./');
                }
            } else {
                validateID(xss(document.getElementByName("RequestID").value),"requestID");
                numChecker(xss(req.body.price),"price");
                const create = await commissionData.createCommission(xss(req.body.requestID), xss(req.body.price));
                if (create.commissionInserted) {
                    res.redirect('./commissions')
                }
            }
        } catch (e) {
            res.status(400);
            return res.render('users/requestForm', {title: "400 Error", error: e, errorExists: true, loggedIn: req.session.user!=null});
        }
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;