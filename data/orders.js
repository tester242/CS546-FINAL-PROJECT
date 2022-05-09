const mongoCollections = require('../config/mongoCollections');
const orders = mongoCollections.orders;
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const requests = require('./requests');

// function validate (att, field) {
//     if (!field) throw 'Error: Must provide a field to check.';
//     if (typeof field !== 'string') throw 'Error: Must provide a string for field.';
//     if (!(field in orderFields)) throw `Error: ${field} is an invalid field.`;
//     if (!att) throw `Error: ${field} not given.`;
//     if (field === 'id') {
//         if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
//         att = att.trim();
//         if (att.length == 0) throw `Error: ${field} cannot be an empty string.`;
//         if (!ObjectId.isValid(att)) throw 'Error: commissionID is not a valid Object ID.';
//     }
//     if (field === 'total') {
//         if (typeof att !== 'number') throw `Error: ${field} must be a number.`;
//         if (att < 0) throw `Error: ${field} cannot be less than 0.`;
//     }
//     if (field === 'date') {
//         if (typeof att !== 'string') throw `Error: ${field} must be a string.`;
//         if (!isValidDate(att)) throw `Error: ${field} must be a valid date string MM/DD/YYYY.`;
//     }
// }
//checks to see if the given var str is a valid string and not empty
function stringChecker(str, variableName){
    if(typeof str != 'string'){
        throw `${variableName || 'provided variable'} is not a String`;
    }
    if(str.trim().length==0){
        throw 'Strings can not be empty';
    }
}
//checks to see if a given var num(int the form of a string) is a valid number
function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}

//checks to see if a given id(in the form of a string) is a valid objectID
function validateID(id, name){
    if(!id) throw 'must provide an id';
    stringChecker(id,name);
    if(!ObjectId.isValid(id)) throw name+' is not a valid Object ID';
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

//checks to see if the paramters given to createOrder are valid
function validateOrder(userID, cartID, total, date) {
    validateID(userID.toString(), 'userid');
    validateID(cartID.toString(), 'cartid');
    numChecker(total, 'total');
    if (!date) throw 'Error: Must provide a date.';
    if (!isValidDate(date)) throw 'Error: date is not a valid date string.';
}

module.exports = {
    //creates an order with a userID, CartID, and total
    //takes info from user to add to other fields
    //also adds the date it was created
    async createOrder(userID, cartID, total) {
        validateOrder(userID, cartID, total);

        const orderCollection = await orders();
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: ObjectId(userID.trim()) });
        if(!user) throw 'Error: Cannot find user.'; // <<<

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;

        let newOrder = {
            userID: userID,
            cartID: cartID,
            total: total,
            dateSubmitted: today,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip
        }

        const insertOrder = await orderCollection.insertOne(newOrder);
        if (insertOrder.insertedCount === 0) throw 'Error: Could not add new order.';
        return { orderInserted: true };
    },
    
    //returns an order with a given orderID(in the form of an objectID)
    //make sure to check if the return value exists, its done purposefully this way
    async get(orderID) {
        validateID(orderID.toString(), 'orderId');

        const orderCollection = await orders();

        const order = await orderCollection.findOne({ _id: orderID});

        return order;
    },

    //gets all the orders in the system
    async getAll() {
        const orderCollection = await orders();
        const orderList = await orderCollection.find({}).toArray();
        if (orderList) {
            return orderList;
        }
        throw new Error('Could not get all orders');
    },

    //returns orders with a given userID(in the form of an objectID)
    //make sure to check if the return value exists, its done purposefully this way
    async getFromUser(userID) {
        validateID(userID.toString(), 'orderId');

        const orderCollection = await orders();

        const orderList = await orderCollection.find({ userID: userID }).toArray();
        if (orderList) return orderList;
        throw new Error('Could not get all orders from user.');
    },

    //removes an order with a given orderID(in the form of an objectID)
    async remove(orderID) {
        validateID(orderID, 'id');

        var tempID = ObjectId(orderID.trim());

        const orderCollection = await orders();
        const removeOrder = await orderCollection.deleteOne({ _id: tempID });
        if (removeOrder.deleteCount === 0) throw 'Error: Failed to remove order.';

        return { orderRemoved: true };
    }
}