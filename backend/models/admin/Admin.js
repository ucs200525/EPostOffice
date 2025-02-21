const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,default:'admin'},
    lastLogin:{type:Date,default:null}
},{timestamps:true});

module.exports = mongoose.model('Admin',adminSchema);
