const mongoose = require('mongoose')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const User = require('../models/users')


// we are exporting this module and we would require it in our app.js file
module.exports = function(passport){
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {

    // Match user
    User.findOne({
        email:email
    }).then(user => {
        if(!user){
            return done(null, false, {message: "User do not exist"})  
        }

        // where password -> is the unencrypted or unhashed password coming from the form while user.password is the hashed password in the database
        // Match Password
        bcrypt.compare(password, user.password, (err, isMatch,) =>{
            if(err) throw err;
            if(isMatch){
                // we are returning null down here becos we have no error and user cos there was a match
                return done(null, user)
            }else{
                return done(null, false, {message: "Incorrect Password"})
            }
        })
    })
    }));

    passport.serializeUser( (user, done) =>{
        done(null, user.id);
    })

    passport.deserializeUser( (id, done) =>{
        User.findById(id, (err, user)=>{
            done(err, user);
        })
    })
}
