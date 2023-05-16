const mongoose = require('mongoose');

const connectDb = (url) => {
    mongoose.set('strictQuery', false)
    return mongoose.connect(url)
}

module.exports = connectDb
