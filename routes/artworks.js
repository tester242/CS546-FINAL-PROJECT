const express = require('express');
const router = express.Router();
const data = require('../data');
const artData = data.artworks;
const userData=data.users;
const notifData=data.notifications;
const xss = require('xss');

// ROUTES //

// GET /
router.get('/', async (req, res) => {
  try {
    const artworks = await artData.getAllArtworks();
    if(req.session.user){
      const level= await userData.checkUserLevel(req.session.user);
      notifs=[];
      if(level==0){
        notifs=await notifData.getAll();
      }
      if (artworks==[]){
        res.render('users/artworks', {title: "Artworks", artworks: null, loggedIn: true,isAdmin:level==0,notifications:notifs});
      }
      else{
        res.render('users/artworks', {title: "Artworks", artworks: artworks, loggedIn:true,isAdmin:level==0,notifications:notifs});
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

// GET /:id
router.get('/:id', async (req, res) => {
  if (!req.params.id){
    res.status(404);
    res.render('users/artwork', {title: "404 Error", errorExists:true, error: "No artwork id given",loggedIn: req.session.user!=null});
  }
  try {
    var notifs=[];
    var level=1;
    if(req.session.user){
      notifs=await notifData.getAll();
      level=await userData.getUser(req.session.user); 
    }
    const artwork = await artData.getArtwork(xss(req.params.id));
    let hasVideo = true;
    let a = Array(10);
    a[0] = artwork["name"];
    a[1] = artwork["tags"];
    if (a[1]==[]){
      a[1] = "No Tags";
    }
    a[2] = artwork["postedDate"];
    a[3] = artwork["price"];
    a[4] = artwork["artImage"];
    if (!a[4]){
      a[4] = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
    }
    a[5] = artwork["artVideo"];
    if (!a[5]){
      hasVideo = false;
    }
    a[6] = artwork["favorites"];
    a[7] = artwork["overallRating"];
    a[8] = artwork["description"];
    a[9] = artwork["reviews"];
    if (a[9]==[]){
      a[9] = null;
    }
    for (let i = 0; i < a.length; i++){
      if (a[i]===null){
        a[i] = "N/A";
      }
    }
    res.render('users/artwork', {title: "Artwork",name: a[0], tags: a[1], postedDate: a[2], price: a[3], artImage: a[4], hasVideo: hasVideo, artVideo: a[5], 
    favorites: a[6], overallRating: a[7], description: a[8], reviews: a[9],loggedIn: req.session.user!=null,isAdmin:level==0,notifications:notifs});
  } catch (e) {
    res.status(404);
    res.render('users/artwork', {title: "404 Error", errorExists:true, error: e,loggedIn: req.session.user!=null});
  }
});

// POST /:id
router.post('/:id', async (req, res) => {
  if (!req.params.id){
    res.status(404);
    res.render('users/artwork', {title: "404 Error", errorExists:true, error: "No artwork id given"});
  }
  try {
    var name = req.session.user;
    if (!req.session.user){
      name = "Guest";
    }
    var updatedArt = await artData.updateReviews(xss(req.params.id),name,req.body.rating,req.body.review);
    res.redirect("/artworks/"+req.params.id);
  } catch (e) {
    res.status(404);
    res.render('users/artwork', {title: "404 Error", errorExists:true, error: e});
  }
});

module.exports = router;