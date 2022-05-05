const mongoCollections = require('../config/mongoCollections');
const requests = mongoCollections.requests;
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');

const requestFields = ['id', 'title', 'desc'];

function validate(att, field) {
    if (!field) throw 'Error: Must provide a field to check.';
    if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
    if (!(field in requestFields)) throw `Error: ${field} is an invalid field.`;
    if (!att) throw `Error: ${field} not given.`;
    if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
    att = att.trim();
    if (att.length == 0) {
        if (field === 'id') throw `Error: ${field} cannot be an empty string.`;
        if (field === 'title'||field === 'description') throw `Error: Please provide a ${field}`;
    }
    if (field === 'id' && !ObjectId.isValid(att)) throw 'Error: userID is not a valid Object ID.';
}

function validateRequest(id, title, desc) {
    validate(id, 'id');
    validate(title, 'title');
    validate(desc, 'description');
}

module.exports = {
    async createRequest(userID, title, description) {
        validateRequest(userID, title, description);

        const requestCollection = await requests();
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: userID });
        if (!user) throw 'Error: Cannot find user.'; // <<<
        
        let newRequest = {
            userID: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip,
            title: title,
            description: description
        }

        const insertRequest = await requestCollection.insertOne(newRequest);
        if (insertRequest.insertedCount === 0) throw 'Error: Could not add new request.';
        return { requestInserted: true };
    },

    async get(requestID) {
        validate(requestID, 'id');
        
        var tempID = ObjectId(requestID.trim());

        const requestCollection = await requests();

        const request = await requestCollection.findOne({ _id: tempID });
        if (!request) throw 'Error: No request with that ID.';

        return request;
    },

    async remove(requestID) {
        validate(requestID, 'id');

        var tempID = ObjectId(requestID.trim());

        const requestCollection = await requests();
        const removeRequest = await requestCollection.deleteOne({ _id: tempID });
        if (removeRequest.deleteCount === 0) throw 'Error: Failed to remove request with that ID.';

        return { requestRemoved: true };
    }
}