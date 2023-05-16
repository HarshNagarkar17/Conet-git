const router = require('express').Router();
const { User, University, Posts, Nodes } = require('../model/model.models');
const jwt = require('jsonwebtoken');
const { identifyUser } = require('../middlewares/userMiddleware')
const { requireAuth } = require('../middlewares/authMiddleware')
const getuser = require('../utils/getUser');
const { getStudent } = require('../libs/getStudent');
const { getUniversity } = require('../libs/getUniversity');
const { api } = require('../controllers/controller.User');
const { getVideoInformation } = require('../libs/getYoutubeVideo');
const {sendMail} = require('../libs/sendMail');
// ------------------Student Renderings------------------------
// ************************************************************


router.get('/student/login', identifyUser, async (req, res) => {

    const user = await getStudent(req.user);
    if (!user)
        res.render('student-login');
    else
        res.redirect('/student/profile');
})
router.get('/student/register', (req, res) => {

    res.render('student-register')
})

router.get('/student/profile', identifyUser, async (req, res) => {

    const user = await getStudent(req.user);
    
    if (!user)
        return res.redirect('/student/login');
    
    const university_name = await University.findOne({_id:user.university}, 'university_name');

    // const cursor = await Posts.find({byUser:user},).cursor().populate('posted_in_which_node');
    const posts = await Posts.find({ byUser: user }).populate({
        path: 'posted_in_which_node',
        select: 'nodeName',
        options: { sort: { createdAt: 'desc' } }
    });

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].youtubeUrl) {
            const getInfo = await getVideoInformation(posts[i].youtubeUrl);
            if (!getInfo)
                return res.send('Unable to load video');
            posts[i].videoChannel = getInfo.videoChannel;
            posts[i].videoDescription = getInfo.videoDescription;
            posts[i].videoTitle = getInfo.videoTitle;
            posts[i].defaultThumbnail = getInfo.defaultThumbnail;
        }
    }
    // return res.json({length: posts.length});

    res.render('student-profile', { user, posts,university_name });
})


router.get('/student/register/authenticate/otp', (req, res) => {
    var customValue = req.session.userdata;
    if(!customValue)
        return res.redirect('/student/register');

    res.render('student-otp');
    // res.json({mail: customValue.email, otp: customValue.otp});
})

router.get('/student/peer/:peerId',identifyUser, async  (req, res) => {
    const user = await getStudent(req.user);
    const {ObjectId} = require('mongodb');

    if(!user)
        return res.redirect('/student/login');
    
    if(!ObjectId.isValid(req.params.peerId))
        return res.status(404).send('No user found');
    
    const peer = await User.findOne({_id:req.params.peerId});

    const posts = await Posts.find({ byUser: req.params.peerId }).populate({
        path: 'posted_in_which_node',
        select: 'nodeName',
        options: { sort: { createdAt: 'desc' } }
    });

    // res.send(peer);
    // return res.send(peer);
    if(!peer)
        return res.status(404).send('No user found');
    req.params.peerId = peer.fullname;
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].youtubeUrl) {
            const getInfo = await getVideoInformation(posts[i].youtubeUrl);
            if (!getInfo)
                return res.send('Unable to load video');
            posts[i].videoChannel = getInfo.videoChannel;
            posts[i].videoDescription = getInfo.videoDescription;
            posts[i].videoTitle = getInfo.videoTitle;
            posts[i].defaultThumbnail = getInfo.defaultThumbnail;
        }
    }

    if(user.university === peer.university){
        const university_name = await getUniversity(peer.university);
        res.render('student-peer', {user, peer, university_name, posts});    
    }

})
router.get('/student/logout', (req, res) => {
    res.clearCookie('dotcom_user');
    res.redirect('/student/login');
})

router.get('/student/server', identifyUser, async (req, res) => {
    const user = await getStudent(req.user);
    if (!user)
        return res.redirect('/student/login');
    
    const university = await getUniversity(user.university);
    const posts = await Posts.find({ byUser: user.university }).sort({ createdAt: 'desc'});
    // .options({ sort: { createdAt: 'desc' } });

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].youtubeUrl) {
            const getInfo = await getVideoInformation(posts[i].youtubeUrl);
            if (!getInfo)
                return res.send('Unable to load video');
            posts[i].videoChannel = getInfo.videoChannel;
            posts[i].videoDescription = getInfo.videoDescription;
            posts[i].videoTitle = getInfo.videoTitle;
            posts[i].defaultThumbnail = getInfo.defaultThumbnail;
        }
    }
    // return res.json({length: posts.length});
    // return res.render('university-server', { user,posts });
    // return res.send(posts);
    return res.render('student-server', {user, posts, university});

    // res.render('student-profile', { user, posts,university_name })

    // res.render('university-server-view')
});

router.get('/student/nodes', identifyUser, async (req, res) => {

    const user = await getStudent(req.user);
    if (!user)
        return res.redirect('/student/login');

    let nodes = [];
    let cursor = await Nodes.find({ nodeServer: user.university }).cursor();
    // return res.send(user.university);
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        nodes.push({ node: doc })
    }
    // let nodes = await University.find({_id:user.university}, 'nodes').populate({
    //     path: 'nodes',
    //     options: { sort: { createdAt: 'desc' } }
    // });
    // return res.json({nodes});

    res.render('student-nodes', { user, nodes });
})

router.get('/student/peers', identifyUser, async (req, res) => {
    const user = await getStudent(req.user);

    if (!user)
        return res.redirect('/student/login');
    let peers = await User.find({ university: user.university });
    // let peers = [];
    // return res.json({peers});
    // for (let doc = await cursor.next(); doc != null; doc = await cursor.next())
    //     peers.push({ peer: doc });

    res.render('student-peers', { user, peers });
})




router.get('/node/:nodeName', identifyUser, async (req, res) => {
    const user = await getStudent(req.user);
    if (!user)
        return res.redirect('/student/login');
    
    const userUniversity = await getUniversity(user.university)
    const nodeId = await Nodes.findOne({nodeName: req.params.nodeName}, '_id');
    
    // return res.send(nodeId);

    if (!(await University.find({ _id: user.university, nodes: { $in: [nodeId] }})))
        return res.status(404).send('No node with this Name');
    // const node = await Nodes.findOne({ nodeName: req.params.nodeName }).populate('nodePosts');
    // const node = await Nodes.findOne({nodeName:req.params.nodeName}).sort({createdAt: 'desc'}).populate('nodePosts').exec();
    // const node = await Nodes.findOne({ nodeName: req.params.nodeName })
    // .populate('nodePosts')
    // .sort({ createdAt: -1 })
    // .limit(1);
    let node = await Nodes.findOne({ nodeName: req.params.nodeName })
        .populate({
            path: 'nodePosts',
            options: { sort: { createdAt: 'desc' } }
        });

    if (node) {
        if (node.nodePosts.length > 0) {
            // return res.json({post: node.nodePosts[0]});
            let byUser = [];
            for (let i = 0; i < node.nodePosts.length; i++) {
                if (node.nodePosts[i].youtubeUrl) {
                    const getInfo = await getVideoInformation(node.nodePosts[i].youtubeUrl);
                    if (!getInfo)
                        return res.send('Unable to load the video')
                    node.nodePosts[i].videoTitle = getInfo.videoTitle;
                    node.nodePosts[i].videoDescription = getInfo.videoDescription;
                    node.nodePosts[i].videoChannel = getInfo.videoChannel;
                    node.nodePosts[i].defaultThumbnail = getInfo.defaultThumbnail;
                }

                byUser.push(await User.findOne({ _id: node.nodePosts[i].byUser }));
            }

            return res.render('student-server-posts', { user, node, byUser });
        }
        return res.render('student-server-posts', { user, node});
    }
    res.status(404).send("No node found");
})


router.get('/api', api);

router.get('/student/settings',identifyUser, async(req, res) => {
    const user = await getStudent(req.user);

    if(!user)
        return res.redirect('/student/login');

    res.render('student-settings', {user});
})


// --------------------University Renderings----------------------
// ***************************************************************

router.get('/university/register', (req, res) => {
    res.render('university-register');
})

router.get('/university/login', identifyUser, async (req, res) => {
    const user = await getUniversity(req.user);
    if (!user)
        res.render('university-login');
    else
        res.redirect('/server');
})

router.get('/server', identifyUser, async (req, res) => {
    const user = await getUniversity(req.user);
    if (!user)
        return res.redirect('/university/login')
    
        // const university_name = await University.findOne({_id:user.university}, 'university_name');

        // const cursor = await Posts.find({byUser:user},).cursor().populate('posted_in_which_node');
        const posts = await Posts.find({ byUser: user.id }).sort({ createdAt: 'desc'});
        // .options({ sort: { createdAt: 'desc' } });
    
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].youtubeUrl) {
                const getInfo = await getVideoInformation(posts[i].youtubeUrl);
                if (!getInfo)
                    return res.send('Unable to load video');
                posts[i].videoChannel = getInfo.videoChannel;
                posts[i].videoDescription = getInfo.videoDescription;
                posts[i].videoTitle = getInfo.videoTitle;
                posts[i].defaultThumbnail = getInfo.defaultThumbnail;
            }
        }
        // return res.json({length: posts.length});
    
        // res.render('student-profile', { user, posts,university_name })

    return res.render('university-server', { user,posts });
})

router.get('/university/peer/:studentId',identifyUser, async(req, res) => {
    const user = await getUniversity(req.user);

    const {ObjectId} = require('mongodb');

    if(!user)
        return res.redirect('/student/login');
    
    if(!ObjectId.isValid(req.params.studentId))
        return res.status(404).send('No user found');
    
    const peer = await User.findOne({_id:req.params.studentId});
    // return res.json({peer});
    const posts = await Posts.find({ byUser: req.params.studentId }).populate({
        path: 'posted_in_which_node',
        select: 'nodeName',
        options: { sort: { createdAt: 'desc' } }
    });

    // res.send(peer);
    // return res.send(peer);
    if(!peer)
        return res.status(404).send('No user found');
    
    if(user.id !== peer.university)
        return res.send('This user does not belong to you server');

    req.params.studentId = peer.fullname;
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].youtubeUrl) {
            const getInfo = await getVideoInformation(posts[i].youtubeUrl);
            if (!getInfo)
                return res.send('Unable to load video');
            posts[i].videoChannel = getInfo.videoChannel;
            posts[i].videoDescription = getInfo.videoDescription;
            posts[i].videoTitle = getInfo.videoTitle;
            posts[i].defaultThumbnail = getInfo.defaultThumbnail;
        }
    }

    const university_name = await getUniversity(peer.university);
    res.render('univeristy-peer', {user, peer, university_name, posts});    
})

router.get('/university/node/:nodeName', identifyUser, async (req, res) => {
    
    const user = await getUniversity(req.user);
    if (!user)
        return res.redirect('/university/login');
    
    // const {ObjectId} = require('mongodb');
    // if(!ObjectId.isValid(req.params.nodeName))
    //     return res.status(400).send('No node found');

    const userUniversity = await getUniversity(user.university)
    const nodeId = await Nodes.findOne({nodeName: req.params.nodeName}, '_id');
    
    // return res.send(nodeId);

    if (!(await University.find({ _id: user.id, nodes: { $in: [nodeId] }})))
        return res.status(404).send('No node with this Name');
    // const node = await Nodes.findOne({ nodeName: req.params.nodeName }).populate('nodePosts');
    // const node = await Nodes.findOne({nodeName:req.params.nodeName}).sort({createdAt: 'desc'}).populate('nodePosts').exec();
    // const node = await Nodes.findOne({ nodeName: req.params.nodeName })
    // .populate('nodePosts')
    // .sort({ createdAt: -1 })
    // .limit(1);
    let node = await Nodes.findOne({ nodeName: req.params.nodeName })
        .populate({
            path: 'nodePosts',
            options: { sort: { createdAt: 'desc' } }
        });

    if (node) {
        let byUser = [];
        if (node.nodePosts.length > 0) {
            // return res.json({post: node.nodePosts[0]});
            for (let i = 0; i < node.nodePosts.length; i++) {
                if (node.nodePosts[i].youtubeUrl) {
                    const getInfo = await getVideoInformation(node.nodePosts[i].youtubeUrl);
                    if (!getInfo)
                        return res.send('Unable to load the video')
                    node.nodePosts[i].videoTitle = getInfo.videoTitle;
                    node.nodePosts[i].videoDescription = getInfo.videoDescription;
                    node.nodePosts[i].videoChannel = getInfo.videoChannel;
                    node.nodePosts[i].defaultThumbnail = getInfo.defaultThumbnail;
                }

                byUser.push(await User.findOne({ _id: node.nodePosts[i].byUser }));
            }

            return res.render('university-node-posts', { user, node, byUser });
        }
        return res.render('university-node-posts', { user, node, byUser});
    }
    res.status(404).send("No node found");
})


router.get('/university/create-post', identifyUser, async(req, res) => {

    const user = await getUniversity(req.user);

    if(!user)
        return res.status(400).redirect('/university/login');      
    return res.render('university-create-post', {user});

});


router.get('/university/peers', identifyUser, async (req, res) => {

    const user = await getUniversity(req.user);
    if (!user)
        return res.redirect('/university/login');

    let cursor = await User.find({ university: user.id }).cursor();
    let students = [];
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        students.push({ student: doc });
    }

    res.render('university-peers', { user, students });

})

router.get('/create-node', identifyUser, async (req, res) => {
    const user = await getUniversity(req.user);
    if (!user)
        return res.redirect('/university/login');

    res.render('university-create-server', { user })
})

router.get('/university/nodes', identifyUser, async (req, res) => {

    const user = await getUniversity(req.user);

    if (!user)
        return res.redirect('/university/login');
    let nodes = [];
    let cursor = await Nodes.find({ nodeServer: user.id }).cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        nodes.push({ node: doc })
    }

    res.render('university-nodes', { user, nodes });
})
router.get('/university/logout', (req, res) => {
    res.clearCookie('dotcom_user');
    res.redirect('/university/login');
})
// router.get('/editor', (req, res) => {
//     res.render('editor')
// })

// router.get('/token', (req,res) => {
//     res.render('token');
// })

// router.get('/settings', async(req, res)=>{

//     if(req.session.isAuth){
//         const student_id = req.session.studentId;
//         const student = await User.findOne({_id:student_id});

//         if(!student){
//             //flash variable to show message to register the account
//             req.flash('login_msg', 'please login to continue!')
//             res.redirect('/login')
//             return;
//         }else{
//             res.render('student-settings', {
//                 student
//             })
//         }

//     }else{
//         req.flash('login_msg', 'please login to continue!')
//         res.redirect('/login');
//     }
// })

//router.get('/projects', (req, res) => {
//     res.render('search-projects');
// })
// router.get('/publish', (req, res) => {
//     res.render('create-project');
// })
// router.get('/feed', async(req, res) => {
//     console.log(req.session.isAuth);
//     if(req.session.isAuth){
//         const student_id = req.session.studentId;
//         const student = await User.findOne({_id:student_id});

//         if(!student){
//             //flash variable to show message to register the account
//             req.flash('login_msg', 'please login to continue!')
//             res.redirect('/login')
//             return;
//         }else{
//             res.render('student-profile', {
//                 student
//             })
//         }

//     }else{
//         req.flash('login_msg', 'please login to continue!')
//         res.redirect('/login');
//     }
// })
// router.get('/getUser', async(req, res) => {
//     var user = await getuser(req.session.studentId);
//     console.log("user:", user);
//     res.json(user);
// })
// router.get('/secure',requireAuth, async(req, res) => {

//     const _id = req.user;
//     const user = await User.findOne({_id});
//     if(!user)
//         return res.redirect('/login');

//     res.render('secure', {user});
// })
module.exports = router;