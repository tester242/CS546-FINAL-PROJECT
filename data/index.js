/* Name: Anton Danylenko, Danielle Faustino, Kyle Henderson, Nicholas Whitt
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Group 17 Final Project
*/

const userData = require('./users');
const artworksData = require('./artworks');
const commissionsData = require('./commissions');
const notificationsData = require('./notifications');
const ordersData = require('./orders');
const requestsData = require('./requests');
const shoppingCartData = require('./shoppingCart');

module.exports = {
  users: userData,
  artworks: artworksData,
  commissions: commissionsData,
  notifications: notificationsData,
  orders: ordersData,
  requests: requestsData,
  shoppingCart: shoppingCartData
};