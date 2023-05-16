const {University, Nodes, Posts} = require('../model/model.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {checkPasswordStrength} = require('../libs/passwordChecker')
const {createToken} = require('../libs/tokenGenerator')
const {getVideoInformation} = require('../libs/getYoutubeVideo');

exports.register = async(req, res) => {
    
    const {uname, email, password, about} = req.body;
    console.log(req.body);
    try {
        if(!uname || !email || !password || !about)
            return res.json({status: 'fail', msg:'please provide information'});
        
        //search for servers
        if(await University.findOne({email}))
            return res.json({status:'fail', msg:'Server already exist'});

        const passwordValidate = checkPasswordStrength(password);
        if(!passwordValidate)
            return res.json({status:'fail', msg:'password is weak'});

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const emailCode = email.split('@')[1];
        const server = await University.create({
            university_name:uname, email,about, emailCode, password:hashedPassword
        });

        if(!server)
            return res.json({status:'fail', msg:'failed to register server'});

        res.json({status:'success', server});
    } catch (error) {
        return res.json({status:'fail', msg:error})
    }
}

exports.login = async(req, res) => {

    const {email, password} = req.body;
    try {

        if(!email || !password)
            return res.json({status: 'fail', msg:'please provide details'});

        const server = await University.findOne({email});

        if(!server)
            return res.json({status:'fail', msg: 'No Server found with this Email'});

        if(!(await bcrypt.compare(password, server.password)))
            return res.json({status:'fail', msg:'Incorrect password'});

        const token = await createToken(server.id);
        const maxAge = 3 * 24 * 60 * 60;

        res.cookie('dotcom_user', token, {httpOnly:true, maxAge:maxAge*1000})

        res.json({status:'success', server});

    } catch (error) {
        res.json({status:'fail', msg:error})
    }
}

exports.universities = async(req, res) => {
    const universities = await University.find({});
    res.json({universities});
}
exports.registerEmail = async(req, res) => {
    const {email, name} = req.body;

    const universityEmail = await Emails.create({email, name});

    return res.json(universityEmail);
}

exports.updateCover = async(req, res) => {
    const _id = req.user;
    const file = req.file.filename;
    try {
        if((await University.findOneAndUpdate({_id}, {coverImage:file})))
            return res.redirect('/server');
        else
            throw new Error('failed to update')
        
    } catch (error) {
        res.send(error);
    }

}

exports.updateProfile = async(req, res) => {
    const _id = req.user;
    const file = req.file.filename;
    try {
        if((await University.findOneAndUpdate({_id}, {profileImage:file})))
            return res.redirect('/server')
        else
            throw new Error('failed to update')
    } catch (error) {
        res.send(error);
    }
}

exports.publishPost = async(req, res) => {
    const {content,youtubeUrl} = req.body;
    const byUser = req.user;
    try {
        if(!byUser || !content)
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

        const post = await Posts.create({byUser, content,youtubeUrl, posted_in_which_node: byUser});
        const updateUniversityModel = await University.findOneAndUpdate({_id:byUser}, { $push: {posts: post.id}}, {
            new:true
        });
        // const updateNode = await Nodes.findOneAndUpdate({_id:posted_in_which_node},{$push: {nodePosts:post.id}, }, {
        //     new:true
        // });

        if(!post || !updateUniversityModel)
            return res.status(400).json({status: 'fail', msg: 'Failed to create post'});

        return res.status(200).json({status: 'success', msg: 'Post Successful', user: updateUniversityModel});
    } catch (error) {
        console.log(error);
    }
}
exports.createNode = async(req, res) => {
    const {nodeName, nodeTags, nodeAbout} = req.body;
    const nodeServer = req.user;
    try {
        if(!nodeName || !nodeTags || !nodeAbout)
            return res.status(500).json({status:'fail', msg: 'Please enter valid information'});
        
        if(await Nodes.findOne({nodeName: new RegExp('^'+ nodeName + '$', 'i')}))
            return res.status(500).json({status:'fail', msg: 'Node with this name already exist'});

        const node = await Nodes.create({nodeName:nodeName.trim(),nodeTags, nodeAbout, nodeServer});

        if(!node || !(await University.findOneAndUpdate({_id:nodeServer}, {$push: {nodes:node.id}})))
            return res.status(500).json({status: 'fail', msg: 'Failed to create node'});
        
        return res.json({status: 'success', node});

    } catch (error) {
        res.send(error);
    }
}