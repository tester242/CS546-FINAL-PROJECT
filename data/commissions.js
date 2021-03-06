const mongoCollections = require('../config/mongoCollections');
const commissions = mongoCollections.commissions;
const requests = mongoCollections.requests;
const { ObjectId } = require('mongodb');
const { getFromUser } = require('./requests');

const commissionFields = ['id', 'price'];

//checks to see if the var id(given in the form of a string) is a valid object id
function validateID(id, name){
    if(!id) throw 'must provide an id';
    stringChecker(id,name);
    if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
}

//checks to see if a given variable is a valid string
function stringChecker(str, variableName){
    if(typeof str != 'string')throw `${variableName || 'provided variable'} is not a String`;
    if(str.trim().length==0)throw 'Strings can not be empty';
}

//checks to see if a given var num(given in the form of a string) is a valid number
function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}


// function validateID(att, field) {
//     if (!field) throw 'Error: Must provide a field to check.';
//     if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
//     if (!(field in commissionFields)) throw `Error: ${field} is an invalid field.`;
//     if (!att) throw `Error: ${field} not given.`;
//     if (field === 'id') {
//         if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
//         att = att.trim();
//         if (att.length == 0) throw `Error: ${field} cannot be an empty string.`;
//         if (!ObjectId.isValid(att)) throw 'Error: commissionID is not a valid Object ID.';
//     }
//     if (field === 'price') {
//         if (typeof att !== 'number') throw `Error: ${field} must be a number.`;
//         if (att < 0) throw `Error: ${field} cannot be less than 0.`;
//     }
// }

// function validateCommission(request, price) {
//     validate(request, 'id');
//     validate(price, 'price');
// }

module.exports = {
    //creates a commission from a request and a price
    async createCommission(requestID, price) {
        validateID(requestID.toString(),"requestID");
        numChecker(price);

        var newPrice = price.toFixed(2);
        const commissionCollection = await commissions();
        const requestCollection = await requests();
        const request = await requestCollection.findOne({ _id: requestID });
        if (!request) throw 'Error: Cannot find request.'; // <<<

        let newCommission = {
            commissionID: requestID,
            status: "Order Confirmed.",
            price: newPrice
        }

        const insertCommission = await commissionCollection.insertOne(newCommission);
        if (insertCommission.insertedCount === 0) throw 'Error: Could not add new commission.';
        return { commissionInserted: true };
    },
    //returns a commission  from a given commissionID(in the form of an objectID)
    //may return null, this is on purpose
    async get(commissionID) {
        validateID(commissionID.toString(), 'id');

        const commissionCollection = await commissions();

        const commission = await commissionCollection.findOne({ _id: commissionID });
       
        return commission;
    },
    /*gets all commissions of a user from the commission collection 
    @param  userID: ObejctID
    @return request, can be null
    */
    //make sure to check if the return value exists, its done purposefully this way
    async getFromUser(userID) {
        validateID(userID.toString(), 'id');

        const commissionCollection = await commissions();

        const commission = await commissionCollection.find({ userID: userID }).toArray();
        
        return commission;
    },

    //removes a commission using a given commissionID(in the form of an objectID)
    async remove(commissionID) {
        validateID(commissionID.toString(), 'id');

        const commissionCollection = await commissions();
        const removeCommission = await commissionCollection.deleteONe({ _id: commissionID });
        if (removeCommission.deleteCount === 0) throw 'Error: Failed to remove commission with that ID.';

        return { commissionRemoved: true };
    },
    
    //updates a given commissions field with a sepcified value
    async update(commissionID, field, val) {
        validateID(commissionID.toString(), 'id');
        const commissionCollection = await commissions();
        const commission = this.get(commissionID);
        if (!field) throw 'Error: Must provide a field.';
        if (!val) throw `Error: Must provide a value to update ${field}.`
        if (field === 'price') {
            if (typeof val !== 'number') throw 'Error: Price must be a number.';
            if (val < 0) throw 'Error: Price cannot be negative.';
            val = val.toFixed(2);
            const updatedCommission = await commissionCollection.updateOne(
                { _id: commission._id },
                { $set: { price: val }}
            )

            if (updatedCommission.modifiedCount === 0) {
                throw 'Error: Could not update price successfully.';
            }
        }
        if (field === 'status') {
            if (typeof val !== 'string') throw 'Error: Status must be a string.';
            if (val.trim().length === 0) throw 'Error: String cannot be empty.';
            const updatedCommission = await commissionCollection.updateOne(
                { _id: commission._id },
                { $set: { status: val }}
            )

            if (updatedCommission.modifiedCount === 0) {
                throw 'Error: Could not update price successfully.';
            }
        }
    }
}
