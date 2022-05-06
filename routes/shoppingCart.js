const express = require('express');
const router = express.Router();
const data = require('../data');
const userData= data.users;
const cartData = data.shoppingCart;
const artData = data.artwork;

// ROUTES //

// GET /
router.get('/', async (req, res) => {
  try {
    if(req.session.user){ 
      const user= await userData.getUser(req.session.user);
      var cart= await cartData.get(user._id);
      if(!cart){
        cart=await cartData.createCart(user._id);
      }
    //no getCart command, theres a get(userid) command
       //? need to create a cart if the user does not hav one and use the user id for to check
      var artThumbnails = [];
      for (let i=0; i<cart.artIds.length;i++){
        const artwork = artData.getArtwork(cart.artIds[i]);
        var thumbnail = {};
        thumbnail.name = artwork.name;
        var prices=cartData.getMultipliers();
        thumbnail.price = artwork.price * prices[cart.format[i]];
        thumbnail.artImage = artwork.artImage;
        console.log(thumbnail);
        artThumbnails.append(thumbnail);
      }
      let cartNotEmpty = artThumbnails==[];

      res.render('users/shoppingCart', {cartNotEmpty: cartNotEmpty, artworks: artThumbnails, subtotal: cart.subtotal,loggedIn: true});
    }
    else{
      res.render('users/login');
    }
  } catch (e) {
    res.status(404);
    res.render('users/shoppingCart', {title: "404 Error", error: e, errorExists:true,loggedIn: req.session.user!=null});
  }
});

module.exports = router;