const mongoCollections = require('../config/mongoCollections');
const requests = mongoCollections.requests;
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');

const requestFields = ['id', 'title', 'desc'];

function stringChecker(str, variableName){
    if(typeof str != 'string')throw `${variableName || 'provided variable'} is not a String`;
    if(str.trim().length==0)throw 'Strings can not be empty';
}

function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}

function zipChecker(zip){
    return isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
}

function emailChecker(email){
    stringChecker(email,'Email');
    if(email.indexOf('@')<=0||email.indexOf('.')<=2)throw 'Error: Email improperly formatted';
}

function validateID(id, name){
    if(!id) throw 'must provide '+name;
    stringChecker(id,name);
    if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
}

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
    async createRequest(userID,name, email, address, city, state, zip, title, description) {
        validateRequest(userID,name, email, address, city, state, zip, title, description);

        const requestCollection = await requests();
        
        let newRequest = {
            userID: userID,
            name: name,
            email: email,
            address: address,
            city: city,
            state: state,
            zip: zip,
            title: title,
            description: description
        }

        const insertRequest = await requestCollection.insertOne(newRequest);
        if (insertRequest.insertedCount === 0) throw 'Error: Could not add new request.';
        return { requestInserted: true };
    },

    async get(requestID) {
        validateID(requestId.toString(),"requestId");

        const requestCollection = await requests();

        const request = await requestCollection.findOne({ _id: requestID });
        if (!request) throw 'Error: No request with that ID.';

        return request;
    },

    async getAll(){
        const requestCollection = await requests();

        const requestList= await requestCollection.find({}).toArray();

        for(let i=0; i<requestList.length;i++){
            requestList[i]._id=requestList[i]._id.toString();
        }

        return requestList;
    },

    async remove(requestID) {
        validateID(requestId.toString(),"requestId")

        const requestCollection = await requests();
        const removeRequest = await requestCollection.deleteOne({ _id: requestID });
        if (removeRequest.deleteCount === 0) throw 'Error: Failed to remove request with that ID.';

        return { requestRemoved: true };
    }
}