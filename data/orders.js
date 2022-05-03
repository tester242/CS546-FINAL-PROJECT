const mongoCollections = require('../config/mongoCollections');
const orders = mongoCollections.orders;
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const requests = require('./requests');

module.exports = {
    async createOrder(cartID, total, dateSubmitted) {
        validateOrder(cartID, total, dateSubmitted);

        const orderCollection = await orders();
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: cartID.userID });
        if(!user) throw 'Error: Cannot find user.'; // <<<

        let newOrder = {
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