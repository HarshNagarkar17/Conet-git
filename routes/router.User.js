const express = require('express')
const router = express.Router();
const {register, login, setHeader, updateCoverImage, updateProfileImage, publishPost, getUser, students, settings, verifyOtp} = require('../controllers/controller.User.js')
// const { storage, upload } = require('../middlewares/multer.js')
const { requireAuth } = require('../middlewares/authMiddleware.js');
const multer = require('multer');
const {User, University} = require('../model/model.models.js')
const {getEmailCode} = require('../libs/getUniversity');
const {getStudent} = require('../libs/getStudent.js');
const {createToken} = require('../libs/tokenGenerator');
const {identifyUser} = require('../middlewares/userMiddleware.js');
const { api } = require('../controllers/controller.Node.js');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'Coveruploads')
    },
    filename: function(req, file, cb) {
        const filename = file.originalname.replace(/ /g, '.');
        cb(null, req.user+ "_"+ filename)
    }
});
const upload = multer({storage:storage});


const storage2 = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'profileUploads')
    },
    filename: function(req, file, cb) {
        const filename = file.originalname.replace(/ /g, '.');
        cb(null, req.user+"_"+filename)
    }
})

const upload2 = multer({storage:storage2});

router.post('/registerStudent',register);
router.post('/loginStudent', login);
router.post('/setHeader', setHeader);
router.post('/change-cover-photo',identifyUser,upload.single('cover-picture'), updateCoverImage)
router.post('/updateProfilePicture', identifyUser, upload2.single('profile-picture'), updateProfileImage)
router.post('/post', identifyUser,publishPost);
router.post('/getUser', getUser);
router.post('/students', students);
router.post('/student-setting',identifyUser,settings);
router.post('/verify-otp', async(req, res) => {
    const {otp} = req.body;
    console.log('otp', otp);
    console.log('session', req.session.userdata.otp);
    const fullname = req.session.userdata.fullname;
    const email= req.session.userdata.email;
    const password = req.session.userdata.password;
    const userOTP = req.session.userdata.otp;
    const department = req.session.userdata.department;

    if(otp !== userOTP)
        return res.json({status: 'fail', msg:'Invalid OTP'});
    
    const emailCode = email.split('@')[1];
    const check = await getEmailCode(emailCode);

    const createStudent = await User.create({
               fullname,email,password,university:check, department});

            if(!createStudent) return res.json({status:'fail', msg:'failed to register'});
            //  create session variables to store user information

            if((await University.findOneAndUpdate({_id:check}, {$push: {students:createStudent.id}}))){
                const maxAge = 3 * 24 * 60 * 60;
                const token = await createToken(createStudent.id);
                res.cookie('dotcom_user', token,{httpOnly:true,maxAge:maxAge*1000});
                // console.log(token, "Register Cookie"); 
                delete req.session.userdata;
                // console.log('session after deleting', req.session.userdata);
                return res.json({status: 'success', student: createStudent})
            }else{
                return res.json({status:'fail', msg:'failed to register you! try again'});
            }
});

module.exports = router
