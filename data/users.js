/* Name: Anton Danylenko, Danielle Faustino, Kyle Henderson, Nicholas Whitt
   Pledge: I pledge my honor that I have abided by the Stevens Honor System.
   Assignment: CS 546 Group 17 Final Project
*/

const bcrypt = require('bcrypt');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const saltRounds = 2;



// HELPER FUNCTIONS //

// isAlphaNumeric function references StackOverflow
const isAlphaNumeric = function isAlphaNumeric(str) {
    let code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
}

const checkValidUsername = function checkValidUsername(str) {
    //const alphanumeric = new RegExp('/^[a-z0-9]+$/i');
    if (!str) throw 'Error: Username must be provided.';
    if (typeof str != 'string') throw `Error: Username must be a string.`;
    if (str.indexOf(' ')!=-1) throw 'Error: Username must not contain spaces.';
    if (str.trim().length < 4){
        console.log("this is the string "+str+"!");
        throw `Error: Username must be at least 4 characters long.`;
    } 
    if (!isAlphaNumeric(str)) throw 'Error: Username must only contain alphanumeric characters.';
}

const checkValidPassword = function checkValidPassword(str) {
    if (!str) throw 'Error: Password must be provided.';
    if (typeof str != 'string') throw `Error: Password must be a string.`;
    if (str.indexOf(' ')!=-1) throw 'Error: Password must not contain spaces.';
    if (str.trim().length < 6) throw `Error: Password must be at least 6 characters long.`;
}

const checkValidInput = function checkValidInput(username, password) {
    if (!username || !password) throw 'Error: Username and password must be provided.';
    checkValidUsername(username);
    checkValidPassword(password);
}


 
 
// MAIN FUNCTIONS //
 
async function createUser(username, password) {
    checkValidInput(username, password);

    const userCollection = await users();
    const hash = await bcrypt.hash(password, saltRounds);

    username = username.toLowerCase();
    const user = await userCollection.findOne({username: username});
    if (user) throw 'Error: There is already an existing user with that username.';

    let newUser = {
        username: username,
        password: hash,
        userLevel: 1
    }

    const insertUser = await userCollection.insertOne(newUser);

    if (!insertUser.acknowledged || !insertUser.insertedId) throw 'Internal Server Error';

    return {userInserted: true};
}
 
async function checkUser(username, password) {
    checkValidInput(username, password);

    const userCollection = await users();

    username = username.toLowerCase();
    const user = await userCollection.findOne({username: username});
    if (!user) throw 'Error: Either the username or password is invalid.';

    let compareToMatch = false;
    compareToMatch = await bcrypt.compare(password, user.password);
    
    if (compareToMatch) {
        if (!user.userLevel) {
            return {authenticated: true,
                    admin: true};
        } else {
            return {authenticated: true,
                    admin: false};
        }
    } else {
        throw 'Error: Either the username or password is invalid.'
    }
}

async function checkUserLevel(username) {
    checkValidUsername(username);

    const userCollection = await users();

    username = username.toLowerCase();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'Error: User not found.';

    return user.userLevel;
}

async function updateUserLevel(username) {
    checkValidUsername(username);

    const userCollection = await users();

    username = username.toLowerCase();
    const user = await userCollection.findOne({username: username});
    if (!user) throw 'Error: User not found.';

    let newLevel;
    if (!user.userLevel) {
        newLevel = 1;
    } else {
        newLevel = 0;
    }

    const updatedUser = await userCollection.updateOne(
        { _id: user._id },
        { $set: { userLevel: newLevel }}
    )

    if (updatedUser.modifiedCount === 0) {
        throw 'Error: Could not update user level successfully.';
    }
}
 
 
module.exports = {
    firstName: "Danielle", 
    lastName: "Faustino", 
    studentId: "10447762",
    createUser,
    checkUser,
    checkUserLevel,
    updateUserLevel
};