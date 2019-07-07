const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Схема хранения игр
var GameSchema = new Schema({
    type:           { type: String, default: ''},                   // w5x36 и т.д.
    id:             { type: Number, default: 0 },
    winNumbers:     { type: Array, default: [] },
    totalFund:      { type: Number, default: 0 },
    p5:             { type: Number, default: 0 },
    p4:             { type: Number, default: 0 },
    p3:             { type: Number, default: 0 },
    p2:             { type: Number, default: 0 },
    status:         { type: Number, default: 0 },                   // 0 - Создана, 1 - доступна для игры
    created:        { type: Date, default: Date.now }
})

module.exports = mongoose.model('Game', GameSchema)