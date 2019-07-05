const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PibSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    chatId: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('pib',PibSchema);
