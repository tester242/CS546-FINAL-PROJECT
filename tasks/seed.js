const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;
const artworks = data.artworks;
const commissions = data.commissions;
const notifications = data.notifications;
const orders = data.orders;
const requests = data.requests;
const shoppingCart = data.shoppingCart;

const main = async() => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    const db = await dbConnection();
    await db.dropDatabase();
// admin user
    const admin = await users.createUser('admin', 'tester242', 'tester242', 'Test', 'Admin', 'admin@gmail.com', 'He/Him', 4, 'Hoboken', 'NJ');
// nonadmin user
    const user = await users.createUser('user', 'tester232', 'tester232', 'Test', 'User', 'user@gmail.com', 'He/Him', 4, 'Hoboken', 'NJ')
// artwork
    const artwork = await artworks.createArtwork('Test', 'Test,Image', today, )
}
