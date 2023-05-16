const {University} = require('../model/model.models');

async function getUniversity(_id) {
    const user = await University.findOne({_id});

    if(!user) return 0;
    return user;
}
async function getEmailCode(emailCode) {
    // check emiailcode for university
    //if exist return true and university id to add the student
    const university = await University.findOne({emailCode});

    if(!university)
        return false;
    else{
        return university.id;
    }
}

module.exports = {
    getUniversity,
    getEmailCode
};