const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


var userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    university:{
        type:String,
        ref:'University',
        default:'none',
        trim:true
    },
    department:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required:false,
        trim:true
    }],
    isVerified:{String},
    coverPicture:{
        type:String,
        required:false
    },
    profilePicture:{
        type:String,
        required:false
    },
    password:{ //password will be hashed before storing
        type:String,
        required:true,
        trim:true
    },
});

userSchema.pre('save', function(next) {
    this.fullname = this.fullname.charAt(0).toUpperCase() + this.fullname.slice(1);
    next();
  });


  
// Posts Schema
var postSchema = new mongoose.Schema({
    byUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
        trim:true
    },
    posted_in_which_node:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Nodes'
    },
    content:{ type:String, required:true},
    youtubeUrl: {type:String, trim:true},
    // createdAt: { type: Date, default: Date.now, get: v => v.toDateString() }
    createdAt: {
        type: Date,
        default: Date.now,
        get: function(v) {
          return v.toLocaleString();
        }
      }      
});

// University Schema
var universitySchema = new mongoose.Schema({
    university_name:{
        type:String,
        required:true,
        unique:true,
        index:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    emailCode:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    about:{
        type:String
    },
    students:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Students'
    }],
    nodes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Nodes'
    }],
    coverImage: {type:String},
    profileImage: {type:String},
    departments:[{
        type:String,
        required:false
    }],
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts',
    }],
    state:{type:String},
    city:{type:String},
    createdAt: {
        type: Date,
        default: Date.now,
        get: function(v) {
          return v.toLocaleString();
        }
      } 
});


var nodeSchema = new mongoose.Schema({
    nodeName: {
        type:String,
        required:true,
    },
    nodeTags:{type:String, required:true},
    nodePosts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts'
    }],
    nodeAbout:{type:String, required:true},
    nodeServer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Universities'
    }
});
//hash the password
// userSchema.pre("save", function(next){
//     bcrypt.genSalt(10, function(err, salt){
//         bcrypt.hash(this.password, salt, function(err, hash){
//             if(err) throw new Error(err);

//             this.password = hash;
//         });
//     });
// });


// Method to compare passwords before logging into the account
userSchema.methods.comparePasswords = function(password){
    bcrypt.compare(password, this.password, function(err, result){
        if(err) throw new Error("failed to compare");
        return result;
    })
}
//Export the model

const User = mongoose.model('Students', userSchema);
const University = mongoose.model('Universities', universitySchema);
const Posts = mongoose.model('Posts', postSchema);
const Nodes = mongoose.model('Nodes', nodeSchema);

module.exports = {
User, University, Posts, Nodes
};