const mongoCollections = require('../config/mongoCollections');
const shoppingCart = mongoCollections.shoppingCart;
const artworks=mongoCollections.artworks;
const { ObjectId } = require('mongodb');

function stringChecker(str, variableName){
    if(typeof str != 'string'){
        throw `${variableName || 'provided variable'} is not a String`;
    }
    if(str.trim().length==0){
        throw 'Strings can not be empty';
    }
}

let exportedMethods={
    async createCart(userId) {
        if(!userId) throw 'must provide user ID';
        stringChecker(userId,'ID');
        if(!ObjectId.isValid(userId)) throw ' userID is not a valid Object ID';
        const cartCollection= await shoppingCart();
        let newCart={
            artIds: [],
            format:[],
            userId: userId,
            subtotal: 0
        }
        const insertCart = await cartCollection.insertOne(newCart);

        if (!insertCart.acknowledged || !insertCart.insertedId) throw 'Internal Server Error';

        return {cartInserted: true};
    },
    async get(cartID){
        if(!cartId) throw 'must provide cart ID';
        stringChecker(cartId,'cartID');
        if(!ObjectId.isValid(cartId)) throw ' cartID is not a valid Object ID';
        
        var newID=ObjectId(cartID);
        
        const cartCollection= await shoppingCart();

        const cart=await cartCollection.findOne({_id:newID});
        if(cart==null) throw 'no cart with that ID';

        return cart;
    },
    //can add or subtract to the cart total based on the operation var
    //operation needs to equal to "add" or "sub"
    async fixTotal(artID,cartID,operation){
        if(!cartId) throw 'must provide cart ID';
        stringChecker(cartId,'cartID');
        if(!artId) throw 'must provide art ID';
        stringChecker(artId,'artID');
        if(!ObjectId.isValid(cartId)) throw ' cartID is not a valid Object ID';
        if(!ObjectId.isValid(artId)) throw ' artID is not a valid Object ID';
        if(!operation) throw 'must provide an operation to do';
        var newCartId=ObjectId(cartId);
        var newArtId=ObjectId(artId);
        const cartCollection= await shoppingCart();
        const artCollection=await artworks();
        var oldCart =await this.get(cartId);
        var oldTotal= oldCart.subtotal;
        if(operation=="add"){
            
        }
    },
    async addArt(artId,cartId,format){
        if(!cartId) throw 'must provide cart ID';
        stringChecker(cartId,'cartID');
        if(!artId) throw 'must provide art ID';
        stringChecker(artId,'artID');
        if(!format) throw 'must provide format for art';
        stringChecker(format,'format');
        if(!ObjectId.isValid(cartId)) throw ' cartID is not a valid Object ID';
        if(!ObjectId.isValid(artId)) throw ' artID is not a valid Object ID';
        var newCartId=ObjectId(cartId);
        var newArtId=ObjectId(artId);
        const cartCollection= await shoppingCart();
        var oldCart=await this.get(cartId);
        var total= fixTotal(artID,cartId,"add");
        let updatedCart={
            artIds: oldCart.artIds.push(newArtId),
            format: oldCart.format.push(format),
            userId: oldCart.userId,
            subtotal: total
        }
        await cartCollection.updateOne({ _id: newCartId }, { $set: updatedCart});

        return {artInserted: true};
    }
}
// MAIN FUNCTIONS //
 

async function createUser(username, password) {
    checkValidInput(username, password);

    const userCollection = await users();
    const hash = await bcrypt.hash(password, saltRounds);

    username = username.toLowerCase();
    const user = await userCollection.findOne({username: username});
    if (user) throw 'Error: There is already an existing user with that username.';

    let newUser = {
        username: username,
        password: hash,
        userLevel: 1
    }

    const insertUser = await userCollection.insertOne(newUser);

    if (!insertUser.acknowledged || !insertUser.insertedId) throw 'Internal Server Error';

    return {userInserted: true};
}
module.exports = exportedMethods;