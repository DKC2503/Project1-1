const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        default: 'Join the NewsPercent Team' 
    },
    description: { 
        type: String, 
        required: true 
    },
    googleFormLink: { 
        type: String, 
        required: true 
    },
    buttonText: { 
        type: String, 
        required: true, 
        default: 'Apply Now' 
    },
    status: { 
        type: String, 
        enum: ['OPEN', 'CLOSED'], 
        default: 'OPEN' 
    },
    published: { 
        type: String, 
        enum: ['Published', 'Draft'], 
        default: 'Published' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
