const express = require('express');
const router = express.Router();
const data = require('../data');
const artData = data.artworks;
const userData=data.users;

// ROUTES //

// GET /
router.get('/', async (req, res) => {
  try {
    const artworks = await artData.getAllArtworks();
    if(req.session.user){
      const level= await userData.checkUserLevel(req.session.user);
      if (artworks==[]){
        res.render('users/artworks', {title: "Artworks", artworks: null, loggedIn: true,isAdmin:level==0});
      }
      else{
        res.render('users/artworks', {title: "Artworks", artworks: artworks, loggedIn:true,isAdmin:level==0});
      }
    }
    else{
      // console.log(artworks);
      if (artworks==[]){
        res.render('users/artworks', {title: "Artworks", artworks: null, loggedIn: req.session.user!=null});
      }
      else{
      res.render('users/artworks', {title: "Artworks", artworks: artworks, loggedIn: req.session.user!=null});
      }
    }
  } catch (e) {
    return res.status(400).json(e)
  }
});

// router.post('/', async (req, res) => {};

module.exports = router;