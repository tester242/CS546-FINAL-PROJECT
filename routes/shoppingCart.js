const express = require('express');
const router = express.Router();
const data = require('../data');
const cartData = data.shoppingCart;
const artData = data.artwork;

// ROUTES //

// GET /
router.get('/', async (req, res) => {
  try {
    //no getCart command, theres a get(userid) command
    const cart = await cartData.getCart(); //? need to create a cart if the user does not hav one and use the user id for to check
    console.log(cart);
    let artThumbnails = [];
    for (index in cart["artId"]){
      const artwork = await artData.getArtwork(cart["artId"][index]);
      let thumbnail = {};
      thumbnail.name = artwork.name;
      thumbnail.price = artwork.price * cartData.getMultipliers()[cart["format"][index]];
      thumbnail.artImage = artwork.artImage;
      console.log(thumbnail);
      artThumbnails.append(thumbnail);
    }
    let cartNotEmpty = artThumbnails==[];

    res.render('users/shoppingCart', {cartNotEmpty: cartNotEmpty, artworks: artThumbnails, subtotal: cart["subtotal"]});
  } catch (e) {
    res.status(404);
    res.render('users/shoppingCart', {title: "404 Error", error: e});
  }
});

module.exports = router;