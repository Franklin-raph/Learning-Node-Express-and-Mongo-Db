const express = require('express')
const User = require('../models/users')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')


// user login route
router.get('/login', (req, res)=>{
    res.render('users/login', { page_title: 'Login' })
})

// user login functionality
router.post('/login', (req, res, next) => {
    console.log("=================================")
    console.log(req.body)
    console.log("=================================")
    // req.session.cookie.maxAge = 30*24*60*60*1000
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
});

// user register route
router.get('/register', (req, res)=>{
    res.render('users/register', { page_title: 'Register' })
})

// user register functionality
router.post('/register', (req, res) =>{

    let userDetails = req.body

    if(userDetails.password.length < 4){
        req.flash('error_msg', 'Password must contain at least 4 characters')
        res.redirect('register')
    }else if (userDetails.password !== req.body.password2){
        req.flash('error_msg', 'Password did not match')
        res.redirect('register')
    }else{
    User.findOne({email: req.body.email})
        .then(user =>{
            if(user){
                req.flash('error_msg', "Email already exists")
                res.redirect('register')
            }else{
                const newUser = new User({
                    name: userDetails.name,
                    email: userDetails.email,
                    password: userDetails.password
                });
        
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash)=> {
                        if(err)  throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                console.log(user)
                                req.flash('success_msg', 'Registered successfully')
                                res.redirect('/users/login')
                            })
                            .catch( err => {
                                console.log("An error occured while creating a user" + err )
                                
                            })
                    });
                });
                console.log("New users details")
                console.log(newUser)
            }
        })
    }  
})

// Logout functionality
router.get('/logout', (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out successfully")
    res.redirect('/users/login')
})

module.exports = router