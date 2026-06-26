const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        title: {
            type: String,
            default: 'New Chat'
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_doc, ret) => {
                delete ret._id;
            }
        }
    }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
