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

function stringChecker(str, variableName){
    if(typeof str != 'string')throw `${variableName || 'provided variable'} is not a String`;
    if(str.trim().length==0)throw 'Strings can not be empty';
}

function numChecker(num, variableName){
    if(typeof num != 'string')throw `${variableName || 'provided variable'} can't be converted into a number`;
    const newNum=Number(num);
    if(!Number.isInteger(newNum))throw`${variableName || 'provided variable'} is not a number`;
    if(newNum<=0)throw 'Numbers can not be less than or equal to zero';
}


function emailChecker(email){
    stringChecker(email,'Email');
    if(email.indexOf('@')<=0||email.indexOf('.')<=2)throw 'Error: Email improperly formatted';
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

const checkValidInputTotal = function checkValidInput(username, password, confirmPassword, firstName, lastName, email, pronouns, age, city, state) {
    if (!username || !password||!confirmPassword||!firstName||!lastName||!email||!pronouns||!age||!city||!state) throw 'Error: All Fields must be provided.';
    checkValidUsername(username);
    checkValidPassword(password);
    checkValidPassword(confirmPassword);

    if(password!==confirmPassword)throw 'Error: Password and Confirm Password do not match.';

    stringChecker(firstName,'First Name');
    stringChecker(lastName, 'Last Name');
    stringChecker(pronouns,'pronouns');
    stringChecker(city,'City');
    stringChecker(state,'State');

    numChecker(age);

    emailChecker(email);
}



 
 
// MAIN FUNCTIONS //
 
async function createUser(username, password, confirmPassword, firstName, lastName, email, pronouns, age, city, state) {
    checkValidInputTotal(username, password, confirmPassword, firstName, lastName, email, pronouns, age, city, state)

    const userCollection = await users();
    const hash = await bcrypt.hash(password, saltRounds);

    username = username.toLowerCase();
    const user = await userCollection.findOne({username: username});
    if (user) throw 'Error: There is already an existing user with that username.';
    const newAge=Number(age);
    let newUser = {
        firstName:firstName,
        lastName:lastName,
        email:email,
        pronouns:pronouns,
        age:newAge,
        city:city,
        state:state,
        username: username,
        password: hash,
        favoritesCount:0,
        favoritedArt:[],
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
async function getUser(username) {
    checkValidUsername(username);

    const userCollection = await users();

    username = username.toLowerCase();
    const user = await userCollection.findOne({ username: username });
    if (!user) throw 'Error: User not found.';

    return user;
}
 
 
module.exports = {
    firstName: "Danielle", 
    lastName: "Faustino", 
    studentId: "10447762",
    createUser,
    checkUser,
    checkUserLevel,
    updateUserLevel,
    getUser
};