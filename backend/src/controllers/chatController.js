const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

exports.getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getSession = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);
        
        if (!session || session.userId.toString() !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const messages = await Message.find({ sessionId: session.id }).sort({ createdAt: 1 });
        res.json({ ...session.toJSON(), messages });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { title } = req.body;
        const session = await ChatSession.create({
            userId: req.user.userId,
            title: title || 'New Chat'
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);
        if (!session || session.userId.toString() !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        await Message.deleteMany({ sessionId: req.params.id });
        await ChatSession.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { title } = req.body;
        const session = await ChatSession.findById(req.params.id);
        if (!session || session.userId.toString() !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const updatedSession = await ChatSession.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true, runValidators: true }
        );
        res.json(updatedSession);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.searchChats = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.json([]);
        }

        const sessions = await ChatSession.find({ userId: req.user.userId }).select('_id');
        const sessionIds = sessions.map((session) => session._id);
        const messages = await Message.find({
            sessionId: { $in: sessionIds },
            content: { $regex: query, $options: 'i' }
        })
            .populate('sessionId')
            .sort({ createdAt: -1 });

        res.json(messages.map((message) => ({
            ...message.toJSON(),
            session: message.sessionId?.toJSON(),
            sessionId: message.sessionId?.id || message.sessionId
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
