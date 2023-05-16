require('dotenv').config();
const port = process.env.PORT;
const express = require('express')
const server = express()
const path = require('path');
const connectDb = require('./database/connect');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const jwt = require('jsonwebtoken');
//EJS
server.set('view engine', 'EJS');

//json middlewares
server.use(express.json());
server.use(express.urlencoded({ extended:true }));

//Cookies and sessions
server.use(cookieParser());
server.use(session({
    secret:'Secret Key',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false, maxAge: 60 *60 * 1000}
}));

//flash
server.use(flash());


//create global variables
server.use((req, res, next) => {
    res.locals.login_msg = req.flash('login_msg') // when the user tries to access profile
                                                    // without logging
    next();
})
//static files
server.use('/css',express.static('./assets/css/'));
server.use('/js', express.static('./assets/js/'));
server.use('/img/avatars', express.static('./assets/images/avatars/'));
server.use('/img/cover', express.static('./assets/images/bg/'));
server.use('/auth', express.static('./auth/'));
server.use('/data', express.static('./assets/data/'));
server.use('/Coveruploads', express.static('./Coveruploads/'));
server.use('/profileUploads', express.static('./profileUploads/'));
server.use('/universityCoverImages', express.static('./assets/images/universityCoverImages/'))
server.use('/universityProfileImages', express.static('./assets/images/universityProfileImages/'))
// console.log(__dirname);


//routes
server.use('/', require('./routes/router.render.js'));
server.use('/api/user', require('./routes/router.User.js'));
server.use('/api/university', require('./routes/router.University.js'));
server.use('/api/node', require('./routes/router.Node.js'));
const con = async() => {
    try {
        await connectDb(process.env.URI)
        server.listen(port, () => console.log(`server listening on ${port}`))
    } catch (error) {
        console.log(error.message);
    }
}

con();
