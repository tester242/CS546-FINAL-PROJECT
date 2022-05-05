const express = require('express');
const router = express.Router();
const data = require('../data');
const artData = data.artworks;

// ROUTES //

// GET /
// router.get('/', async (req, res) => {
//   try {
//       if (req.session.user) {
//           res.redirect('/private');
//       } else {
//           res.render('users/login');
//       }
//   } catch (e) {
//       return res.status(400).json(e)
//   }
// });

// GET /
router.get('/artworks', async (req, res) => {
  try {
    const artworks = await artData.getAllArtworks();
    // console.log(artworks);
    res.render('users/artworks', {artworks: artworks, loggedIn: req.session.user!=null});
  } catch (e) {
    return res.status(400).json(e)
  }
});

module.exports = router;