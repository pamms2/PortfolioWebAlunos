const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Log = Schema({
    ip: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    route: String,
    userAgent: String
});

module.exports = mongoose.model("Log", Log)