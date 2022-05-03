const mongoCollections = require('../config/mongoCollections');
const commissions = mongoCollections.commissions;
const requests = mongoCollections.requests;
const { ObjectId } = require('mongodb');

function validate(att, field) {
    if (!att) throw `Error: ${field} needs to be a valid value.`;
    if (field === 'id') {
        if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
        att = att.trim();
        if (att.length == 0) {
            if (field === 'id') throw `Error: ${field} cannot be an empty string.`;
        }
        if (!ObjectId.isValid(att)) throw 'Error: userID is not a valid Object ID.';
    }
    if (field === 'price') {
        if (typeof att !== 'number') throw `Error: ${field} must be a number.`;
    }
}

module.exports = {
    async createCommission(requestID, price) {
        validate(requestID, 'id');

        var tempID = ObjectId(requestID.trim());
        var newPrice = price.toFixed(2);
        const commissionCollection = await commissions();
        const requestCollection = await requests();
        const request = await requestCollection.findOne({ _id: tempID });
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

    async get(commissionID) {
        validate(commissionID, 'id');

        var tempID = ObjectId(commissionID.trim());

        const commissionCollection = await commissions();

        const commission = await commissionCollection.findOne({ _id: tempID });
        if (!commission) throw 'Error: No commission with that ID.';

        return commission;
    },

    async remove(commissionID) {
        validate(commissionID, 'id');

        var tempID = ObjectId(commissionID.trim());

        const commissionCollection = await commissions();
        const removeCommission = await commissionCollection.deleteONe({ _id: tempID });
        if (removeCommission.deleteCount === 0) throw 'Error: Failed to remove commission with that ID.';

        return { commissionRemoved: true };
    },
    
    // async update(commissionID, field, val) {
        // validate field; check if field is price or status 
        //  - (should not update title or desc of commission)
        // if field is price, update price
        // if field is status, update status
    // }
}
