const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true
        },
        password: String,
        name: String,
        isGuest: {
            type: Boolean,
            default: false
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

module.exports = mongoose.model('User', userSchema);
