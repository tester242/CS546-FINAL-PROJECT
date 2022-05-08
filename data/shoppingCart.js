const mongoCollections = require('../config/mongoCollections');
const shoppingCart = mongoCollections.shoppingCart;
const artworks=mongoCollections.artworks;
const { ObjectId } = require('mongodb');

//this is for the format that the artwork is being bought in
//further changes to types of artwork can be added into here and have no issues on this page
//price field is a multiplier to the actual artwork itself
//placeholder for pricing
const prices={digital:1.0, print:1.8}

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

let exportedMethods={
    getMultipliers(){
        return prices;
    },
    async createCart(userId) {
        validateID(userId.toString(),"userId");
        const cartCollection= await shoppingCart();
        let newCart={
            artIds: [],
            format:[],//when adding art and formats in, check formats against prices, this can be gotten useing getMultipliers()
            userId: userId,
            subtotal: 0,
            purchased: 0
        }
        const insertCart = await cartCollection.insertOne(newCart);

        if (!insertCart.acknowledged || !insertCart.insertedId) throw 'Internal Server Error';

        return {cartInserted: true};
    },
    async get(userID){
        validateID(userID.toString(),"userId");
        var newUserID=ObjectId(userID);
        
        const cartCollection= await shoppingCart();
        
        const cart=await cartCollection.findOne({userId:newUserID,purchased:0});
        
        return cart;
    },
    //can add or subtract to the cart total based on the operation var
    //operation needs to equal to "add" or "sub"
    async fixTotal(artId,cartId,mult,operation){
        //error checking inputs
        validateID(cartId,"cartId");
        validateID(artId,"artId");
        if(!operation) throw 'must provide an operation to do';
        //end error checking inputs

        var newCartId=ObjectId(cartId);
        var newArtId=ObjectId(artId);
        const cartCollection= await shoppingCart();
        const artCollection=await artworks();
        var oldCart =await cartCollection.findOne(newCartId);
        var artwork =await artCollection.findOne(newArtId);
        var total= oldCart.subtotal;
        var artPrice= artwork.price*mult;
        
        //actually fixing the total;
        if(operation=="add"){
            total+=artPrice;
        }
        else{
            if(operation=="sub"){
                total-=artPrice;
            }else{
                throw 'invalid operation';
            }
        }

        //making sure the math worked out
        if(oldTotal<0) throw 'Price error: less than 0';
        return total;
    },
    //allows art to be added to the cart
    async addArt(artId,cartId,format){
        //error checking inputs
        validateID(cartId,"cartId");
        validateID(artId,"artId");
        if(!format) throw 'must provide format for art';
        stringChecker(format,'format');
        //end error checking inputs 

        var newCartId=ObjectId(cartId);
        var newArtId=ObjectId(artId);
        const cartCollection= await shoppingCart();
        var oldCart=await this.get(cartId);

        //checking what the price should be multiplied by
        var mult=0;
        prices[format];
        if(mult==0) throw 'invalid format';


        var total= fixTotal(artID,cartId,mult,"add");
        let updatedCart={
            artIds: oldCart.artIds.push(newArtId),
            format: oldCart.format.push(format),
            userId: oldCart.userId,
            subtotal: total
        }
        await cartCollection.updateOne({ _id: newCartId }, { $set: updatedCart});

        return {artInserted: true};
    },
    //allows art to be removed from the cart
    async removeArt(artId,cartId,format){
        //error checking inputs
        validateID(cartId,"cartId");
        validateID(artId,"artId");
        if(!format) throw 'must provide format for art';
        stringChecker(format,'format');
        //end error checking inputs

        var newCartId=ObjectId(cartId);
        var newArtId=ObjectId(artId);
        const cartCollection= await shoppingCart();
        var oldCart=await this.get(cartId);
        
        //checking if the art is in the cart and if so where
        var indexOf=-1;
        for(let x=0;x<oldCart.artIds.length;x++){
            if(oldCart.artIds[x]==newArtId){
                indexOf=x;
                break;
            }
        }
        if(indexOf===-1)throw'art not found';

        //checking what the price should be multiplied by
        var mult=0;
        prices[format];
        if(mult==0) throw 'invalid format';

        var total= fixTotal(artId,cartId,mult,"sub");
        let updatedCart={
            artIds: oldCart.artIds.splice(indexOf,1),
            format: oldCart.format.splice(indexOf,1),
            userId: oldCart.userId,
            subtotal: total
        }
        await cartCollection.updateOne({ _id: newCartId }, { $set: updatedCart});

        return {artDeleted: true};
    }
}
// MAIN FUNCTIONS //
 


module.exports = exportedMethods;