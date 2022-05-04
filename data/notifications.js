const mongoCollections = require('../config/mongoCollections');
const notifications = mongoCollections.notifications;
const { ObjectId } = require('mongodb');

function validate(att, field) {

}

module.exports = {
    async createNotification(message, dateSent) {
        validateNotification(message, dateSent);

        const notifCollection = await notifications();
        
        let newNotif = {
            message: message,
            dateSent: dateSent
        }

        const insertNotification = await notifCollection.insertOne(newNotif);
        if (insertNotification.insertedCount === 0) throw 'Error: Could not add new notification.';
        return { notificationInserted: true };
    },

    async get(notifID) {
        validate(notifID, 'id');

        var tempID = ObjectId(notifID.trim());
        
        const notifCollection = await notifications();

        const notification = await notifCollectionlfindOne({ _id: tempID });
        if (!notification) throw 'Error: No notification with that ID.';

        return notification;
    },

    async remove(notifID) {
        validate(notifID, 'id');

        var tempID = ObjectId(notifID.trim());

        const notifCollection = await notifications();

        const removeNotification = await notifCollection.deleteOne({ _id: tempID });
        if (removeNotification.deleteCount === 0) throw 'Error: Failed to remove request with that ID.';

        return { notificationRemoved: true};
    }
}