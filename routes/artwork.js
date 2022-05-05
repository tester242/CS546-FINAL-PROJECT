const express = require('express');
const router = express.Router();
const data = require('../data');
const artData = data.artworks;

// ROUTES //

// GET /
router.get('/:id', async (req, res) => {
  if (!req.params.id){
    res.status(404);
    res.render('users/artwork', {title: "404 Error", error: "No artwork id given"});
  }
  try {
    const artwork = await artData.getArtwork(req.params.id);
    console.log(artwork);
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
    res.render('users/artwork', {name: a[0], tags: a[1], postedDate: a[2], price: a[3], artImage: a[4], hasVideo: hasVideo, artVideo: a[5], favorites: a[6], overallRating: a[7], description: a[8], reviews: a[9]});
  } catch (e) {
    res.status(404);
    res.render('users/artwork', {title: "404 Error", error: e});
  }
});

module.exports = router;