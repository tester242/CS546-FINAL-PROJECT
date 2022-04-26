/* Name: Danielle Faustino
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Lab 10
   Notes: Routes index.js
*/

const userRoutes = require('./users');

const constructorMethod = (app) => {
    app.use('/', userRoutes);

    app.use('*', (req, res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;