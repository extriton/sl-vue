const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Схема хранения информации о посещениий сайта
var UserSchema = new Schema({
    address:            { type: String, default: '', unique: true },
    username:           { type: String, default: '' },
    ips:                { type: Array, default: [] },
    chatBlocked:        { type: Boolean, default: false },
    status:             { type: Number, default: 0 },
    created:            { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', UserSchema)