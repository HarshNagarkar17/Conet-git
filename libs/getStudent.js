const {User} = require('../model/model.models');

async function getStudent(_id) {
    const user = await User.findOne({_id});

    if(!user) return 0;
    return user;
}


module.exports = {
    getStudent    
}