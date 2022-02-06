const express = require('express')
const morgan = require('morgan')
const methodOveride = require('method-override')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const ideaRoutes = require('./routes/ideas')
const userRoutes = require('./routes/users')
const passport = require('passport')

// passport config file
require('./config/passport')(passport);

const app = express();

const port = process.env.PORT || 3000


// connect to mongoDB
mongoose.connect('mongodb://localhost/vidjot-dev')
  .then(() => {
    app.listen(port, () => {
        console.log('Server running on port ' + port + " \nMongo Db is connected")
    })
  }).catch((err) => console.log("Error occured"))


// register ejs view engine
app.set('view engine', 'ejs');

// public files middle-Ware
app.use(express.static('public'))

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// morgan middleware
app.use(morgan('dev'))

// method override middle ware
app.use(methodOveride('_method'))

// express-session middle-ware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }));

// passport middle ware this is best placed under the express-session middle-ware
app.use(passport.initialize())
app.use(passport.session())

// connect-flash middle-ware
app.use(flash())

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    // we would have the req.user if we are loged in else the res.locals.user would be set to null
    res.locals.user = req.user || null
    next();
});
// index route
app.get('/', (req, res) =>{
    res.render('home', { page_title: 'Home' })
})

// about route
app.get('/about', (req, res) =>{
    res.render('about', { page_title: 'About' })
})


// ideas routes
app.use('/ideas', ideaRoutes)

// users routes
app.use('/users', userRoutes)

// 404 page route
app.use('/', (req, res) =>{
    res.status(404).render('404', { page_title: '404' })
})





// export function bodyParser(): any {
//   throw new Error('Function not implemented.')
// }

