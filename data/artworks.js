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
function dateChecker(dt,dtName){
  if(typeof dt != 'date'){
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

const artworkFields = ['name', 'tags', 'postedDate', 'price', 'artImage', 'artVideo', 'favorites', 'overallRating', 'description', 'reviews'];

function validateID(id, name){
  if(!id) throw 'must provide '+name;
  stringChecker(id,name);
  if(!ObjectId.isValid(userId)) throw name+' is not a valid Object ID';
}

function validate(att, field) {
  if (!field) throw 'Error: Must provide a field to check.';
  if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
  if (!(field in artworkFields)) throw `Error: ${field} is an invalid field.`;
  if (!att) throw `Error: ${field} not given.`;
  if (field === 'name'||field === 'description'||field === 'tags'||field === 'artImage'||field === 'artVideo') {
    stringChecker(att, field);
  }
  if (field === 'postedDate') {
    dateChecker(att, field);
  }
  if (field === 'price'||field === 'favorites'||field === 'overallRating') {
    numChecker(att, field);
  }
}

function validateArtwork(name, tags, postedDate, price, artImage, artVideo, favorites, overallRating, description) {
  validate(name, 'name');
  validate(tags, 'tags');
  validate(postedDate, 'postedDate');
  validate(price, 'price');
  validate(artImage, 'artImage');
  validate(artVideo, 'artVideo');
  validate(favorites, 'favorites');
  validate(overallRating, 'overallRating');
  validate(description, 'description');
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
    validateID(id);
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