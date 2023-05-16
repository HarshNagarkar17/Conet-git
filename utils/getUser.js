const User = require('../model/model.models');

// function getuser(sessionId){
//     const userDetails =  User.findOne({_id:sessionId})
//     .then((user) => {

//         if(!user){
//             const details = {
//                 success:false,
//                 user:false
//             };
//             return details;
//         }

//         console.log(sessionId, user);
//         const details = {
//             success:true,
//             user:userDetails
//         };
//         return user;
//     })
//     .catch((err) => {
//         console.log(err);
//     })

// }
module.exports = async(sessionId) => {
    const userDetails = await User.findOne({_id:sessionId})

            if(!userDetails){
                const details = {
                    success:false,
                    user:false
                };
                return details;
            }

            console.log(sessionId, userDetails);
            const details = {
                success:true,
                user:userDetails
            };
            return details;
    // let user = {}
    // console.log(user);
    // return user;
}

// module.exports = {
//     getuser
// };