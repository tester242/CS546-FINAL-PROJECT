const express = require('express');
const router = express.Router();
const data = require('../data');
const cartData = data.shoppingCart;
const artData = data.artwork;

// ROUTES //

// GET /
router.get('/shoppingcart', async (req, res) => {
  try {
    const cart = await cartData.getCart();
    console.log(cart);
    let artThumbnails = [];
    for (artid in cart["artId"]){
      const artwork = await artData.getArtwork(artid);
      let thumbnail = {};
      thumbnail.name = artwork.name;
      thumbnail.price = artwork.price;
      thumbnail.artImage = artwork.artImage;
      artThumbnails.append(thumbnail);
    }
    let cartNotEmpty = artThumbnails==[];

    // res.render('shoppingCart', {name: a[0], tags: a[1], postedDate: a[2], price: a[3], artImage: a[4], hasVideo: hasVideo, artVideo: a[5], favorites: a[6], overallRating: a[7], description: a[8], reviews: a[9]});
  } catch (e) {
    res.status(404);
    res.render('shoppingcart', {title: "404 Error", error: e});
  }
});

module.exports = router;