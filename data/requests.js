const mongoCollections = require('../config/mongoCollections');
const requests = mongoCollections.requests;
const notifs = require('./notifications');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const { getFromUser } = require('./orders');

const requestFields = ['id', 'title', 'desc'];

//checks if a given var str is a valid non-empty string
function stringChecker(str, variableName){
    if(typeof str != 'string')throw `${variableName || 'provided variable'} is not a String`;
    if(str.trim().length==0)throw 'Strings can not be empty';
}

//checks to see if num is a valid num
function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}

//checks to see if a given zip is a valid zipcode
//found using stackOverflow
function zipChecker(zip){
    return isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
}

/*checks emails  to make sure theyre a valid objectID
makes sure @ is in it and not the first index
makes sure . is in it and not before the 2nd index
@param email: String
*/
function emailChecker(email){
    stringChecker(email,'Email');
    if(email.indexOf('@')<=0||email.indexOf('.')<=2)throw 'Error: Email improperly formatted';
}

/*checks ID's  to make sure theyre a valid objectID
@param id: String
@param name: String describes the id
*/
function validateID(id, name){
    if(!id) throw 'must provide an id';
    stringChecker(id,name);
    if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
}
/*checks to make sure that all the variables are valid
    @param  userID: ObejctID
    @param  name: String
    @param  email: String
    @param  address: String
    @param  city: String
    @param  state: String
    @param  zip: Number
    @param  title: String
    @param  description: String
    */
function validateRequest(userId,name, email, address, city, state, zip, title, description) {
    validateID(userId.toString(),"userId");
    if(!name||!email||!address||!city||!state||!zip||!title||!description)throw 'Error: all fields must be filled out';
    stringChecker(name,"name");
    stringChecker(address,"address");
    stringChecker(city,"city");
    stringChecker(state,"state");
    stringChecker(zip,"zip");
    stringChecker(title,"title");
    stringChecker(description,"description");

    emailChecker(email);

    if(!zipChecker(zip))throw 'Error: not a valid zip';
}

// function validate(att, field) {
//     if (!field) throw 'Error: Must provide a field to check.';
//     if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
//     if (!(field in requestFields)) throw `Error: ${field} is an invalid field.`;
//     if (!att) throw `Error: ${field} not given.`;
//     if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
//     att = att.trim();
//     if (att.length == 0) {
//         if (field === 'id') throw `Error: ${field} cannot be an empty string.`;
//         if (field === 'title'||field === 'description') throw `Error: Please provide a ${field}`;
//     }
//     if (field === 'id' && !ObjectId.isValid(att)) throw 'Error: userID is not a valid Object ID.';
// }

// function validateRequest(id, title, desc) {
//     validate(id, 'id');
//     validate(title, 'title');
//     validate(desc, 'description');
// }

module.exports = {
    /*gets a request from the request collection
    @param  userID: ObejctID
    @param  name: String
    @param  email: String
    @param  address: String
    @param  city: String
    @param  state: String
    @param  zip: Number
    @param  title: String
    @param  description: String
    @return { requestInserted: true }
    */
    async createRequest(userID,name, email, address, city, state, zip, title, description) {
        validateRequest(userID,name, email, address, city, state, zip, title, description);

        const requestCollection = await requests();
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;

        let newRequest = {
            userID: userID,
            name: name,
            email: email,
            address: address,
            city: city,
            state: state,
            zip: zip,
            commisionDate:today,
            title: title,
            description: description
        }


        const insertRequest = await requestCollection.insertOne(newRequest);
        if (insertRequest.insertedCount === 0) throw 'Error: Could not add new request.';
        notifs.createNotification(userID.toString()+" has put in a commission request");
        return { requestInserted: true };
    },
    /*gets a request from the request collection
    @param  requestID: ObejctID
    @return request, can be null
    */
      //make sure to check if the return value exists, its done purposefully this way
    async get(requestID) {
        validateID(requestID.toString(),"requestId");

        const requestCollection = await requests();

        const request = await requestCollection.findOne({ _id: requestID });

        return request;
    },
    /*gets all the request of a user from the request collection
    @param  userID: ObejctID
    @return request, can be null
    */
    //make sure to check if the return value exists, its done purposefully this way
    async getFromUser(userID) {
        validateID(userID.toString(),"userId");

        const requestCollection = await requests();

        const request = await requestCollection.find({ userID: userID }).toArray();
        

        return request;
    },

    /*returns all the requests 
    @return an array of alll the requests with their id's toString'd
    */
    async getAll(){
        
        const requestCollection = await requests();

        const requestList= await requestCollection.find({}).toArray();

        for(let i=0; i<requestList.length;i++){
            requestList[i]._id=requestList[i]._id.toString();
        }

        return requestList;
    },

    /*deletes a request from a given requestID
      @typedef requestID: ObjectID
      @returns { requestRemoved: true }
    */
    async remove(requestID) {
        validateID(requestId.toString(),"requestId")

        const requestCollection = await requests();
        const removeRequest = await requestCollection.deleteOne({ _id: requestID });
        if (removeRequest.deleteCount === 0) throw 'Error: Failed to remove request with that ID.';

        return { requestRemoved: true };
    }
}