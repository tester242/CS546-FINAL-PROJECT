const mongoCollections = require('../config/mongoCollections');
const orders = mongoCollections.orders;
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const requests = require('./requests');

const orderFields = ['id', 'total', 'date'];

function validate (att, field) {
    if (!field) throw 'Error: Must provide a field to check.';
    if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
    if (!(field in commissionFields)) throw `Error: ${field} is an invalid field.`;
    if (!att) throw `Error: ${field} needs to be a valid value.`;
    if (field === 'id') {
        if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
        att = att.trim();
        if (att.length == 0) throw `Error: ${field} cannot be an empty string.`;
        if (!ObjectId.isValid(att)) throw 'Error: commissionID is not a valid Object ID.';
    }
    if (field === 'total') {
        if (typeof att !== 'number') throw `Error: ${field} must be a number.`;
        if (att < 0) throw `Error: ${field} cannot be less than 0.`;
    }
    if (field === 'date') {
        if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
        if (!isValidDate(att)) throw `Error: ${field} must be a valid date string MM/DD/YYYY.`;
    }
}

// Start StackOverFlow isValidDate
function isValidDate(dateString) {
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};
// End StackOverFlow isValidDate

function validateOrder(userID, cartID, total, date) {
    validate(userID, 'id');
    validate(cartID, 'id');
    validate(total, 'total');
    validate(date, 'date');
}

module.exports = {
    async createOrder(userID, cartID, total, dateSubmitted) {
        validateOrder(userID, cartID, total, dateSubmitted);

        const orderCollection = await orders();
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: ObjectId(userID.trim()) });
        if(!user) throw 'Error: Cannot find user.'; // <<<

        let newOrder = {
            userID: userID,
            cartID: cartID,
            total: total,
            dateSubmitted: dateSubmitted,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip
        }

        const insertOrder = await orderCollection.insertOne(newOrder);
        if (insertOrder.insertedCount === 0) throw 'Error: Could not add new order.';
        return { orderInserted: true };
    },

    async get(orderID) {
        validate(orderID, 'id');

        var tempID = ObjectId(order.trim());

        const orderCollection = await orders();

        const order = await orderCollection.findOne({ _id: tempID });
        if (!order) throw 'Error: No order with that ID.';

        return order;
    },

    async remove(orderID) {
        validate(orderID, 'id');

        var tempID = ObjectId(orderID.trim());

        const orderCollection = await orders();
        const removeOrder = await orderCollection.deleteOne({ _id: tempID });
        if (removeOrder.deleteCount === 0) throw 'Error: Failed to remove order.';

        return { orderRemoved: true };
    }
}