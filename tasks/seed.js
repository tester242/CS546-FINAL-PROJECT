const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;
const artworks = data.artworks;
const commissions = data.commissions;
const requests = data.requests;

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
    const artwork = await artworks.createArtwork('Test', 'Test,Image', today, 29.99, 'https://media.cntraveler.com/photos/60596b398f4452dac88c59f8/5:4/w_3330,h_2664,c_limit/MtFuji-GettyImages-959111140.jpg', 'https://www.youtube.com/embed/x_IVy8ewMbQ', 0, 0, 'A Pretty Picture', []);
// request
    const request = await requests.createRequest(user._id, 'Test User', 'tester232@gmail.com', '1 Castle Point Terr.', 'Hoboken', 'New Jersey', '07030', 'Portrait of Krispy', 'A portrait of my Pomeranian Husky, Krispy!');
// commission
    const commission = await commissions.createCommission(request._id, 29.99);
    console.log('Done seeding database');
    await db.serverConfig.close();
};

main().catch(console.log);