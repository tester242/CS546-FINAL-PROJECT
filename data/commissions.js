const mongoCollections = require('../config/mongoCollections');
const commissions = mongoCollections.commissions;
const requests = mongoCollections.requests;
const { ObjectId } = require('mongodb');

const commissionFields = ['id', 'price'];

function validate(att, field) {
    if (!field) throw 'Error: Must provide a field to check.';
    if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
    if (!(field in commissionFields)) throw `Error: ${field} is an invalid field.`;
    if (!att) throw `Error: ${field} not given.`;
    if (field === 'id') {
        if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
        att = att.trim();
        if (att.length == 0) throw `Error: ${field} cannot be an empty string.`;
        if (!ObjectId.isValid(att)) throw 'Error: commissionID is not a valid Object ID.';
    }
    if (field === 'price') {
        if (typeof att !== 'number') throw `Error: ${field} must be a number.`;
        if (att < 0) throw `Error: ${field} cannot be less than 0.`;
    }
}

function validateCommission(request, price) {
    validate(request, 'id');
    validate(price, 'price');
}

module.exports = {
    async createCommission(requestID, price) {
        validateCommission(requestID, price);

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
    
    async update(commissionID, field, val) {
        validate(commissionID, 'id');
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
