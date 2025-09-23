const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        require:[true,'title is required']
    },
    description:{
        type:String,
        required:[true,'description is required']
    },
    image:{
        type:String,
        required:[true, '2 or more image is required.']
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        require:[true, "UserID required"],
    }
},{timestamps:true})

const blogModel = mongoose.model('Blog', blogSchema)

module.exports = blogModel;