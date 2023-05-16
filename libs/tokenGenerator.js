const jwt = require('jsonwebtoken');

const createToken = (payload) => {
    const maxAge = 3 * 24 * 60 * 60;   //expiry date of token
    
    const key = process.env.SECRET_KEY;
    return jwt.sign({ payload }, key,{expiresIn:maxAge});
}

// function createToken(payload) {}
module.exports = {
    createToken
};