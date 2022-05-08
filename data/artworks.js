const mongoCollections = require('../config/mongoCollections');
const artworks = mongoCollections.artworks;
const { ObjectId } = require('mongodb');

function stringChecker(str, variableName){
  if(typeof str != 'string'){
      throw `${variableName || 'provided variable'} is not a String`;
  }
  if(str.trim().length==0){
      throw 'Strings can not be empty';
  }
}
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
function dateChecker(dt,dtName){
  if(! dt instanceof Date ){
    throw `${dtName || 'provided variable'} is not a date`;
  }
  if(!(dt.getTime()===dt.getTime())){
      throw 'Date is invalid';
  }
}
function numChecker(num,numName){
  if(typeof num != 'number'){
    throw `${numName || 'provided variable'} is not a number`;
  }
  if(num<0){
      throw 'Num needs to be greater than or equal to 0';
  }
}

function validateID(id, name){
  if(!id) throw 'must provide an id';
  stringChecker(id,name);
  if(!ObjectId.isValid(userId)) throw name+' is not a valid Object ID';
}

function validateArtwork(name, tags, postedDate, price, artImage, artVideo, favorites, overallRating, description) {
  stringChecker(name, 'name');
  stringChecker(tags, 'tags');
  dateChecker(postedDate, 'postedDate');
  numChecker(price, 'price');
  stringChecker(artImage, 'artImage');
  isValidHttpUrl(artImage);
  stringChecker(artVideo, 'artVideo');
  isValidHttpUrl(artVideo);
  numChecker(favorites, 'favorites');
  numChecker(overallRating, 'overallRating');
  stringChecker(description, 'description');
}

module.exports = {
  //todo:
  async createArtwork(name, tags, postedDate, price, artImage, artVideo, favorites, overallRating, description, reviews){
    validateArtwork(name, tags, postedDate, price, artImage, artVideo, favorites, overallRating, description);
    
    if(reviews.length>0){
      this.checkReviews(reviews);
    }

    tags=tags.split(',');//string is chopped up into commas

    price=price.toFixed(2);

    const artCollection= await artworks();
    
    let newArt = {
      name: name,
      tags: tags,
      postedDate:	postedDate,
      price: price,
      artImage:	artImage,
      artVideo: artVideo,
      favorites: favorites,
      overallRating: overallRating,
      description: description,
      reviews: reviews
    }

    const insertArt = await artCollection.insertOne(newArt);

    if (!insertArt.acknowledged || !insertArt.insertedId) throw 'Internal Server Error';

    return {artInserted: true};
  },

  checkReviews(reviews){
    for(let x=0;x<reviews.length;x++){
      validateID(reviews[x].id.toString,"reviews ID at index "+x);
      if(!reviews[x].name) throw 'review at index '+x+' does not have a name';
      stringChecker(reviews[x].name,"reviews name at index "+x);
      if(!reviews[x].rating) throw 'review at index '+x+' does not have a rating';
      numChecker(reviews[x].rating,"reviews rating at index "+x);
      if(!reviews[x].review) throw 'review at index '+x+' does not have a review';
      stringChecker(reviews[x].review,"reviews name at review "+x);
    }
  },

  async getArtwork(id){
    if (!id){
      throw new Error('Id needs to be a valid value');
    }
    validateID(id,"artworkid");
    const artCollection = await artworks();
    const artList = await artCollection.find({}).toArray();
    for (artwork of artList){
      if (artwork["_id"] === id) {
        return artwork;
      }
    }
    throw new Error('Could not find artwork with given id');
  },

  async getAllArtworks(){
    const artCollection = await artworks();
    const artList = await artCollection.find({}).toArray();
    if (artList){
      return artList;
    }
    throw new Error('Could not get all artworks');
  }

}