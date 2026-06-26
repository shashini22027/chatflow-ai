const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatSession',
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ['user', 'ai'],
            required: true
        },
        content: {
            type: String,
            required: true
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

module.exports = mongoose.model('Message', messageSchema);
