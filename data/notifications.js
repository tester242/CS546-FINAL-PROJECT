const mongoCollections = require('../config/mongoCollections');
const notifications = mongoCollections.notifications;
const { ObjectId } = require('mongodb');

function stringChecker(str, variableName){
    if(typeof str != 'string')throw `${variableName || 'provided variable'} is not a String`;
    if(str.trim().length==0)throw 'Strings can not be empty';
}

module.exports = {
    async createNotification(message) {
        stringChecker(message);

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;

        const notifCollection = await notifications();
        
        let newNotif = {
            message: message,
            dateSent: today
        }

        const insertNotification = await notifCollection.insertOne(newNotif);
        if (insertNotification.insertedCount === 0) throw 'Error: Could not add new notification.';
        return { notificationInserted: true };
    },

    async get(notifID) {
        validate(notifID, 'id');

        var tempID = ObjectId(notifID.trim());
        
        const notifCollection = await notifications();

        const notification = await notifCollection.findOne({ _id: tempID });
        if (!notification) throw 'Error: No notification with that ID.';

        return notification;
    },

    async getAll() {

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        const notifCollection = await notifications();

        const notification = await notifCollection.find({}).toArray();
        if(notification === undefined || notification.length > 0){
            console.log(notification);
            if(notification[0].dateSent!=today){
                removeAll();
            }
            for(let i=0; i<requestList.length;i++){
                notification[i]._id=notification[i]._id.toString();
            }
        }

        return notification;
    },

    async remove(notifID) {
        validate(notifID, 'id');

        var tempID = ObjectId(notifID.trim());

        const notifCollection = await notifications();

        const removeNotification = await notifCollection.deleteOne({ _id: tempID });
        if (removeNotification.deleteCount === 0) throw 'Error: Failed to remove request with that ID.';

        return { notificationRemoved: true};
    },
    async removeAll() {
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;

        const notifCollection = await notifications();
        const notifications = await notifCollection.find({dateSent:today}).toArray();

        
        const removeNotification = await notifCollection.deleteMany({});

        for(let i=0;i<notifications.length;i++){
            const insertNotification = await notifCollection.insertOne(notifications[i]);
        }
        if (insertNotification.insertedCount === 0) throw 'Error: Could not add new notification.';

        return { notificationsRemoved: true};
    }
}