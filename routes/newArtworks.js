const express = require('express');
const router = express.Router();
const data = require('../data');
const artworkData = data.artworks;
const userData = data.users;
const commissionData = data.commissions;
const xss = require('xss');


function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (e) {
      throw e;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

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


function validateRequest(name, tags, price, artImage, artVideo, description) {
    if(!name||!tags||!artImage||!artVideo||!description||!price)throw 'Error: all fields must be filled out';
    stringChecker(name,"name");
    stringChecker(tags,"tags");
    stringChecker(artImage,"image link");
    isValidHttpUrl(artImage);
    stringChecker(artVideo,"art video");
    isValidHttpUrl(artVideo);
    stringChecker(description,"description");
    numChecker(price,"price");

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
                res.render('users/artworkForm',{loggedIn: true,isAdmin:true}); // Admin-view
            }
        } else {
            res.redirect("/");
        }
    } catch (e) {
        return res.status(400).json(e);
    }
});

// POST /requests
router.post('/', async (req,res) => {
    if(req.session.user){
        try {
            console.log("here");
            const level = await userData.checkUserLevel(req.session.user);
            if (!level) {
                validateRequest(xss(req.body.name), xss(req.body.tags), xss(req.body.price), xss(req.body.artImage), xss(req.body.artVideo)
                , xss(req.body.description));
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
                today = mm + '/' + dd + '/' + yyyy;
                const create = await artworkData.createArtwork(xss(req.body.name), xss(req.body.tags), new Date(today),Number(xss(req.body.price)), xss(req.body.artImage), xss(req.body.artVideo)
                ,0,0, xss(req.body.description),[]);
                console.log(create);
                if (create.artInserted) {
                    res.redirect('./artworks');
                }
            } else {
                    res.redirect('./requests')
            }
        } catch (e) {
            return res.render('users/artworkForm', {error: e, errorExists: true, loggedIn: req.session.user!=null, isAdmin:true});
        }
    }
    else{
        res.redirect('/');
    }
});

module.exports = router;