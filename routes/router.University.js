const router = require('express').Router();
const {register, login, registerEmail, universities, updateCover, updateProfile, createNode, publishPost} = require('../controllers/controller.University');
const multer = require('multer');
const { identifyUser } = require('../middlewares/userMiddleware');

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'assets/images/universityCoverImages')
    },
    filename: function(req, file, cb) {
        const filename = file.originalname.replace(/ /g, '.');
        cb(null, req.user+"_"+filename)
    }
});

let upload = multer({storage});

router.post('/university-register', register);
router.post('/university-login', login);
router.post('/register-email', registerEmail);
router.post('/universities', universities);
router.post('/upload-cover-image',identifyUser, upload.single('cover-image'), updateCover)
router.post('/create-node', identifyUser, createNode);
router.post('/post',identifyUser, publishPost);

storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'assets/images/universityProfileImages')
    },
    filename: function(req, file, cb) {
        const filename = file.originalname.replace(/ /g, '.')
        cb(null, req.user+"_"+filename)
    }
});

// const fileFilter = function (req, file, cb) {
//     const allowedTypes = ['image/png'];
//     if (!allowedTypes.includes(file.mimetype)) {
//       const error = new Error('Wrong file type');
//       error.code = 'LIMIT_FILE_TYPES';
//       return cb(error, false);
//     }
//     cb(null, true);
// }
upload = multer({storage});

router.post('/upload-profile-image',identifyUser,upload.single('profile-upload'), updateProfile );
module.exports = router;