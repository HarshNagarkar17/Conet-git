const jwt = require('jsonwebtoken');

const identifyUser = async(req, res, next) => {
    const token = req.cookies['dotcom_user'];
    if(token){
        await jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if(err) return res.redirect('/student/login');

            req.user = decodedToken.payload;
        })
    }
    next();
}


module.exports = {
    identifyUser
};