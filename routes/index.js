/* Name: Anton Danylenko, Danielle Faustino, Kyle Henderson, Nicholas Whitt
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Group 17 Final Project
*/

const userRoutes = require('./users');
const artRoutes = require('./artworks');
const artRoute = require('./artwork');
const newArtRoutes = require('./newArtworks')
const requestRoutes = require('./requests');
const commissionRoutes = require('./commissions');
const ordersRoutes = require('./orders');
const shoppingCartRoutes = require('./shoppingCart');
//need notifications

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    app.use('/artworks', artRoutes);
    app.use('/newArtworks', newArtRoutes);
    app.use('/artwork', artRoute);
    app.use('/requests', requestRoutes);
    app.use('/shoppingCart',shoppingCartRoutes);
    app.use('/orders',ordersRoutes);
    app.use('/commissions',commissionRoutes);

    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;