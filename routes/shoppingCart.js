const express = require('express');
const router = express.Router();
const data = require('../data');
const userData= data.users;
const cartData = data.shoppingCart;
const artData = data.artwork;
const orderData = data.orders;

function stringChecker(str, variableName){
  if(typeof str != 'string'){
      throw `${variableName || 'provided variable'} is not a String`;
  }
  if(str.trim().length==0){
      throw 'Strings can not be empty';
  }
}

function validateID(id, name){
  if(!id) throw 'must provide an id';
  stringChecker(id,name);
  if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
}

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
      console.log(cart.artIds.length);
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

      res.render('users/shoppingCart', {title: "Shopping Cart", cartNotEmpty: cartNotEmpty, artworks: artThumbnails, subtotal: cart.subtotal,loggedIn: true});
    }
    else{
      res.render('users/login',{title:"Please Log In To Buy"});
    }
  } catch (e) {
    res.status(404);
    res.render('users/shoppingCart', {title: "404 Error", error: e, errorExists:true,loggedIn: req.session.user!=null});
  }
});

router.put('/', async (req,res) => {
  if (!req.params.id){
    res.status(404);
    res.render('users/shoppingCart', {title: "404 Error", errorExists:true, error: "No shoppingCart id given",loggedIn: req.session.user!=null});
  }

  try {
    const user = await userData.getUser(req.session.user);
    var cart = await cartData.get(user._id);
    if (!cart) {
      cart = await cartData.createCart(user._id);
    }
    if (cart.artIDs.length !== 0) {
      const create = orderData.createOrder(user._id, cart._id, cart.subtotal)
      if (create.orderInserted) {
        cart.purchased = 1;
        await cartData.createCart(user._id);
      }
    } else {
      res.render('users/shoppingCart');
    }
    
  } catch (e) {
    res.status(404)
    res.render('users/shoppingCart', {title: "404 Error", error: e, errorExists: true, loggedIn: req.session.user!= null });
  }
});

router.post('/', async (req, res) => {
  try {
    var isAdded = await cartData.addArt(xss(req.body.id),req.session.user,xss(req.body.format));
    console.log("Added to cart");
    res.redirect("/artworks/"+req.body.id);
  } catch (e) {
    res.status(404);
    res.render('users/artwork', {title: "404 Error", errorExists:true, error: e});
  }
});

module.exports = router;