const jwt = require('jsonwebtoken');
const User = require('../model/model.models');

const requireAuth = async(req, res, next) => {

    const token = req.cookies['dotcom_user'];

    if(token) {
        await jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if(err) return res.redirect('student/login');
            // console.log(decodedToken.payload, "token decoded");
            // res.send("view secure page");
            req.user = decodedToken.payload;
            next();
        })
    }else{
        res.redirect('/student/login')
    }
    
    // if(user){
    //     console.log(user, "logging");
    //     await jwt.verify(user, process.env.SECRET_KEY, (err, decodedKey) => {
    //         if(err){
    //             res.json({err:err.message})
    //         }else{
    //             console.log(decodedKey);
    //             next();
    //         }
    //     })
    // }else{
    // }
}


module.exports = {
    requireAuth, 
};