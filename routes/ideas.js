const express = require('express')
const Idea = require('../models/Ideas')
const router = express.Router()
const {ensureAuthenticated} = require('../helpers/auth')  //used for authentication

// add video route
router.get('/addVideo', ensureAuthenticated, (req, res) => {
    res.render('addIdea', { page_title: 'Add Idea' })
})

// view video ideas route
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = []

    if(!req.body.title){
        errors.push({ error_text: "Please add a title" })
    }
    if(!req.body.details){
        errors.push({ error_text: "Please add some details" })
    }

    if(errors.length > 0){
        res.render('addIdea', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }else{

        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id //i used this so when a new article is created it also creates a new user with an id
        }
        
        new Idea(newUser)
            .save()
            .then(response => {
                req.flash('success_msg', 'Video idea has been added successfully')
                res.redirect('/ideas')
            }) 
    }
})

//ideas route
router.get('/', ensureAuthenticated, (req, res)=>{
    Idea.find({user: req.user.id}).sort({ createdAt: -1 }) //user: req.user.id is used to only show a user his own articles
        .then((ideas) => {
            res.render('ideas', { page_title : 'ideas', ideas: ideas})
            console.log(ideas)
        }).catch(err => {
            console.log(err)
        })
})

//edit ideas
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    const idea = await Idea.findById(req.params.id)
    console.log(idea)
        if(idea.user != req.user.id){  //from line 59 to 62 prevents a user from updating another users articles through the url
            req.flash('error_msg', "Not authorized")
            res.redirect('/ideas')
        }else {
            res.render('edit', {page_title: 'Edit idea', idea : idea })
        }
})

// update idea
router.put('/:id', ensureAuthenticated, (req, res)=>{
    Idea.findById(req.params.id)
        .then(result =>{
            result.title = req.body.title;
            result.details = req.body.details;

            result.save()
                .then(result => {
                    req.flash('success_msg', 'Video idea has been updated successfully')
                    res.redirect('/ideas')
                })
        })
})

//delete ideas
router.delete('/:id', ensureAuthenticated, async (req, res )=>{
    const idea = await Idea.findByIdAndDelete(req.params.id)
    req.flash('success_msg', 'Video idea removed successfully')
     res.redirect("/ideas")
 })


module.exports = router