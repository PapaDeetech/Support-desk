const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return conn;
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error.message}`)
        throw error;
    }
}


module.exports = connectDB