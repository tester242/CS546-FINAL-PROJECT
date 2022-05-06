const express = require('express');
const router = express.Router();
const data = require('../data');
const artData = data.artworks;

// ROUTES //

// GET /
router.get('/', async (req, res) => {
  try {
    const artworks = await artData.getAllArtworks();
    // console.log(artworks);
    if (artworks==[]){
      res.render('users/artworks', {title: "Artworks", artworks: null, loggedIn: req.session.user!=null});
    }
    else{
      res.render('users/artworks', {title: "Artworks", artworks: artworks, loggedIn: req.session.user!=null});
    }
  } catch (e) {
    return res.status(400).json(e)
  }
});

module.exports = router;