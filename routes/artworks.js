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
      const user=await userData.get(req.session.user);
      const level= user.checkUserLevel(req.session.user);
      if(!level){
          res.render('users/artworkForm', {title: "Artworks", artworks: artworks, loggedIn: req.session.user!=null});
      }
      if (artworks==[]){
        res.render('users/artworks', {title: "Artworks", artworks: null, loggedIn: req.session.user!=null,isAdmin:!level});
      }
      else{
       
        res.render('users/artworks', {title: "Artworks", artworks: artworks, loggedIn: req.session.user!=null,isAdmin:!level});
      }
    }
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