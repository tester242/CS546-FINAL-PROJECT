/* Name: Anton Danylenko, Danielle Faustino, Kyle Henderson, Nicholas Whitt
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Group 17 Final Project
*/

const userRoutes = require('./users');
const artRoutes = require('./artworks');
const requestRoutes = require('./requests');
const commissionRoutes = require('./commissions');

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    app.use('/artwork', artRoutes);
    app.use('/requests', requestRoutes);
    app.use('/commissions', commissionRoutes);

    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;