const {User, University, Posts, Nodes} = require('../model/model.models'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {createToken} = require('../libs/tokenGenerator');
const {checkPasswordStrength} = require('../libs/passwordChecker')
const {getStudent} = require('../libs/getStudent')
const {getVideoInformation} = require('../libs/getYoutubeVideo');
const {sendMail, generateOTP} = require('../libs/sendMail')
const {encryptOTP, decryptOTP} = require('../libs/encryption');  
const { getEmailCode } = require('../libs/getUniversity');


//register student -- Post request
exports.register = async(req, res) => {
    const {firstname, lastname, email, password, department} = req.body;
    let errors = [];
    try {                     
        if(!firstname || !lastname || !email || !password || !department ){
            return res.json({status:'fail', msg:"Please enter valid information"})
        }

        const checkUser = await User.findOne({email});

        if(checkUser)
            return res.json({status: 'fail', msg: 'Student already exist'});

        //check emailCode to add the student in university page
        const emailCode = email.split('@')[1];
        // console.log('Coe', emailCode);
        const check = await getEmailCode(emailCode);
        if(!check) {
            return res.json({status: 'fail', msg: 'Your University is not registered'});
        }
        const passwordValidate = checkPasswordStrength(password);
        if(!passwordValidate)
            return res.json({status: 'fail', msg: 'Password is weak'});
        else{
            //hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // console.log(hashedPassword);

            if(!hashedPassword) throw new Error('failed to hash the password');
            const fullname = firstname + " " + lastname;
            const userData = {}
            userData.fullname = fullname;
            userData.department = department;
            userData.email = email;
            userData.password = hashedPassword;
            userData.department = department;
            const otp = await generateOTP(6);
            console.log('generating otp', otp);

            const mail = sendMail(email, otp);
            console.log('sending otp', otp);

            if(!mail)
                return res.json({status: 'fail', msg: 'failed to Authenticate'});

            userData.otp = otp;
            // const encrypted_otp = encryptOTP(otp, process.env.SECRET_STRING);
            req.session.userdata = userData;
            console.log('storing otp', userData.otp);
            res.json({status: 'success'})
            // const createStudent = await User.create({
            //    fullname,email,password:hashedPassword});

            // if(!createStudent) throw new Error("failed to create student")
             // create session variables to store user information
            // const token = await createToken(createStudent._id); // create jwt token

            //update the student with the token
            // const updateId = await User.findByIdAndUpdate({_id:createStudent._id}, {token}, {
            //     new:true
            // });
            // if((await University.findOneAndUpdate({_id:check}, {$push: {students:createStudent.id}}))){
            //     if((await User.findOneAndUpdate({_id:createStudent.id}, {university:check}))){
            //     const maxAge = 3 * 24 * 60 * 60;
            //     const token = await createToken(createStudent.id);
            //     res.cookie('dotcom_user', token,{httpOnly:true,maxAge:maxAge*1000});
            //     console.log(token, "Register Cookie"); 
            //     return res.json({status: 'success', student: createStudent})
            //     }else{
            //         return res.json({status: 'fail', msg:'failed to register you! try again'});
            //     }
            // }else{
            //     return res.json({status:'fail', msg:'failed to register you! try again'});
            // }

        }
    } catch (error) {
        console.log(error)
    }
}


//login student -- Post request
exports.login = async(req, res) => {
    const {email, password} = req.body;
    try {

        if(!email || !password){
            // errors.push({msg: "Please enter information"})
            return res.json({ status: 'fail', msg: 'Please enter information'})
        }
        
        // Search for student email
        const student = await User.findOne({email});

        //throw Error if no student found
        if(!student){
            // errors.push({msg: "No student found"});
            return res.json({ status: 'fail', msg: 'No Student Found'})
        }

        //student found -- check for password
        const hashedPassword = await bcrypt.compare(password, student.password);
        
        //if incorrect password then throw Error
        if(!hashedPassword) {
            // errors.push({msg: "Incorrect password"});
            return res.json({ status: 'fail', msg: 'Incorrect Password'})            
        }
        const maxAge = 3 * 24 * 60 * 60;
        const token = await createToken(student.id);
        res.cookie('dotcom_user', token,{httpOnly:true,maxAge:maxAge*1000});
        console.log(token, "logIn");
        // create session variables to store user information
        // req.session.isAuth = true;
        // req.session.studentId = student.id;
        //send the student
        // console.log({session:req.session.studentId, 
            // auth:req.session.isAuth});
        // res.redirect('/feed')
        // const header = req.headers['content-type'];
        // const headerAuth = req.headers['authorization'];


        // const set = await fetch('api/user/setHeader', {
        //     method: 'POST',
        //     headers: {
        //         'authorization': 'Bearer ahb$w2327'
        //     }
        // }).then((res) => res.json());

        // if(set.done === 'false'){
        //     return res.json({status:'fail', msg: 'failed to generate token'})
        // }
        // console.log(set.token);
        return res.status(200).json({status:'success', student})
    } catch (error) {
        console.log(error);
    }
}
exports.setHeader = (req, res) => {
    const header = req.headers['authorization'];
    if(!header)
        return res.status(401).json({done:'false'});
    
    const token = header.split(' ')[1];
    return res.json({done:'true', token});
}
//update skills of student


exports.updateCoverImage = async(req, res) => {
    const user = await getStudent(req.user);
    const filename = req.file.filename.replace(/ /g, '.');
    // console.log('user: ', user.id);

    const updateCover = await User.findOneAndUpdate({_id:user.id}, {coverPicture:filename}, {
        new:true
    });
    if(!updateCover) throw new Error('failed to update')
    res.redirect('/student/profile');
}

exports.updateProfileImage = async(req, res) => {
    const user = await getStudent(req.user);
    const filename = req.file.filename.replace(/ /g, '.');
    const updateCover = await User.findOneAndUpdate({_id:user.id}, {profilePicture:filename}, {
        new:true
    });
    if(!updateCover) throw new Error('failed to update')
    res.redirect('/student/profile');

}

exports.publishPost = async(req, res) => {
    const {content,youtubeUrl, posted_in_which_node} = req.body;
    const byUser = req.user;

    try {
        if(!byUser || !content || !posted_in_which_node)
        return res.status(422).json({status: 'fail', msg:'please provide valid data'});
        if(youtubeUrl) {
            // const videoId = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com|\.be)\/(?:watch\?v=)?(.+)/);
            const videoId = youtubeUrl.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(\S*)?v=[\w-]+(\S*)?$/);
            console.log(videoId);
            if(!videoId)
                return res.status(422).json({status: 'fail', msg:'Invalid youtube URL'});
            const checkVideo = await getVideoInformation(youtubeUrl);
            if(!checkVideo)
                return res.status(422).json({status:'fail', msg:'Invalid youtube URL'});
        }

        const post = await Posts.create({byUser, content,youtubeUrl, posted_in_which_node});
        const updateUserModel = await User.findOneAndUpdate({_id:byUser}, { $push: {posts: post.id}}, {
            new:true
        });
        const updateNode = await Nodes.findOneAndUpdate({_id:posted_in_which_node},{$push: {nodePosts:post.id}, }, {
            new:true
        });

        if(!post || !updateUserModel || !updateNode)
            return res.status(400).json({status: 'fail', msg: 'Failed to create post'});

        return res.status(200).json({status: 'success', post, user: updateUserModel});
    } catch (error) {
        console.log(error);
    }
}

exports.getUser = async(req, res) => {
    const {_id} = req.body;

    const user = await User.findOne({_id}).populate('posts');

    return res.json({user});
}

exports.students = async(req, res) => {
    const students = await User.find({});
    return res.json({students});
}
// exports.updateSkills = async(req, res) => {
//     const {studentSkills} = req.body;
//     console.log(studentSkills);
//     const id = req.session.studentId;
//     console.log(id);
//     let errors = []
//     try {
//         console.log("reached");
//         console.log(id);
//         // addtoset only push unique elements in the Array
//         const student = await User.findByIdAndUpdate({_id:id},{ $addToSet: {skills:studentSkills}}, {
//             new:true
//         });

//         if(student)
//             res.redirect('/settings');
//         else
//             throw new Error("failed")
//             // res.json({errors: {msg:"failed to update skills"}})
//     } catch (error) {
//         res.send(error)
//     }
// }

exports.api = async(req, res) => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcaaasQ";
const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com|\.be)\/(?:watch\?v=)?(.+)/)[1];

const { google } = require('googleapis');
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.API_KEY // Replace with your YouTube API key
});

const response = await youtube.videos.list({
    part: 'snippet',
    id: videoId
});

const video = response.data.items[0];

if(!video)
    return res.json({msg:'failed'});

const videoTitle = video.snippet.title;
const videoDescription = video.snippet.description;
const videoChannel = video.snippet.channelTitle;
const defaultThumbnail = video.snippet.thumbnails.default.url;
return res.json({link:video});
}

exports.verifyOtp = async(req, res) => {
    const {otp} = req.body;
    try {
        
    } catch (error) {
        
    }
}

exports.settings = async(req, res) => {
    // const {firstName, lastName, email, department} = req.body;
    // const updates = {};
    // Object.keys(req.body).forEach(key => {
    // if (req.body[key]  && req.body[key].trim() !== '') updates[key] = req.body[key];
    // });
    // if (Object.values(req.body).every(val => !val.trim())) {
    //     return res.status(422).json({ status: 'fail', msg: 'All values are empty.' });
    //   }

    const updates = Object.entries(req.body.data)
        .reduce((acc, [key, value]) => {
            if (key !== 'email' ) {
                if (/\d/.test(value)) {
                    return res.status(422).json({status: 'fail', msg: 'Numbers are only allowed in Email.'});
                } else if (value.trim()) {
                    acc[key] = value.trim();
                }
            } else if (value.trim()) {
                acc[key] = value.trim();
            }
            return acc;
        }, {});

    
    const user = await getStudent(req.user)
    const [firstName, lastName] = user.fullname.split(" ");

    // avoiding storing undefined in fullname
    if(!updates.firstName && !updates.lastName) 
        updates.fullname = firstName + " " + lastName;
    else if(!updates.firstName)  //same for lastname
        updates.fullname = firstName + " " + updates.lastName;
    else if(!updates.lastName)
        updates.fullname = updates.firstName + " " + lastName;
    else
        updates.fullname = updates.firstName + " " + updates.lastName;
    console.log('updates', updates);

    const updateUser = await User.findOneAndUpdate({_id:user.id}, updates, {new:true});
    console.log('upatedUser', updateUser);
    if(!updateUser) 
        return res.status(422).json({status:'fail', msg:'failed to update Settings'});
    else
        return res.status(200).json({status: 'success', updateUser});

    // res.json({firstName});
    // res.json({hi: 'hi'});

}