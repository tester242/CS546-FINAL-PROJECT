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
router.get('/artwork/:id', async (req, res) => {
  if (!req.params.id){
    res.status(404);
    res.render('artwork', {title: "404 Error", errorType: "error-not-found", error: "No id given"});
  }
  try {
      if (req.session.user) {
          res.redirect('/private');
      } else {
          res.render('users/login');
      }
  } catch (e) {
      return res.status(400).json(e)
  }
});