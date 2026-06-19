const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSessions = async (req, res) => {
    try {
        const sessions = await prisma.chatSession.findMany({
            where: { userId: req.user.userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getSession = async (req, res) => {
    try {
        const session = await prisma.chatSession.findUnique({
            where: { id: req.params.id },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });
        
        if (!session || session.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { title } = req.body;
        const session = await prisma.chatSession.create({
            data: {
                userId: req.user.userId,
                title: title || 'New Chat'
            }
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
        if (!session || session.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        await prisma.message.deleteMany({ where: { sessionId: req.params.id } });
        await prisma.chatSession.delete({ where: { id: req.params.id } });
        
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { title } = req.body;
        const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
        if (!session || session.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const updatedSession = await prisma.chatSession.update({
            where: { id: req.params.id },
            data: { title }
        });
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

        const messages = await prisma.message.findMany({
            where: {
                session: { userId: req.user.userId },
                content: { contains: query }
            },
            include: { session: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
