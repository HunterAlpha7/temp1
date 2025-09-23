const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Just put any of the name']
    },
    email: {
        type: String,
        required: [true, 'Get that e-mail in']
    },
    password: {
        type: String,
        required: [true, 'Need to fill the secret words']
    },
    blogs: [{
        type: mongoose.Types.ObjectId,
        ref: "Blog",
    }, ],
}, {
    timestamps: true
})
const userModel = mongoose.model('User', userSchema)

module.exports = userModel;