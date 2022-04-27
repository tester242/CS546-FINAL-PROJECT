const mongoCollections = require('../config/mongoCollections');
const artworks = mongoCollections.artworks;
const { ObjectId } = require('mongodb');



module.exports = {
  // async createArtwork(name, tags, postedDate, price, artImage, artVideo, favorites, overallRating, description, reviews){
    
  // },

  async getArtwork(id){
    if (!id){
      throw new Error('Id needs to be a valid value');
    }
    if (typeof id !== 'string'){
      throw new Error('Id must be a string');
    }
    id = id.trim();
    if (id.length == 0){
      throw new Error('Id cannot be empty string');
    }
    if (!ObjectId.isValid(id)) {
      throw new Error('Id is not a valid Object ID');
    }
    const artCollection = await artworks();
    const artList = await artCollection.find({}).toArray();
    for (artwork of artList){
      if (artwork["_id"] === id) {
        return artwork;
      }
    }
    throw new Error('Could not find artwork with given id');
  }

}