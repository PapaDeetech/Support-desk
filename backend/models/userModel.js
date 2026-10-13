const mongoose = require('mongoose')

// Define the User schema
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name']
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Please add a password']
        },
        isAdmin: {
        type: Boolean,
        required: true,
        default: false
        },
    },
    {
        timestamps: true
    }
)

// Create the User model based on the schema
const User = mongoose.model('User', userSchema)

module.exports = User