const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: false, 
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email is not valid'],
    },
    password: {
        type: String,
        minlength: 6
    },
    firstname: {
        type: String, 
        required: 'Fisrt name is required', 
        trim: true,
     },
    lastname: {
        type: String, 
        required: 'Last name is required', 
        trim: true,
        lowercase: true,
    },
    role: {
        type: String, 
        require: true,
        enum: ['USER', 'AD'],
        default: 'USER'
    },
    phone: {
        type: String, 
        require: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('User', UserSchema);