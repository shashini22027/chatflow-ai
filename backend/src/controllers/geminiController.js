const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
// Fallback key is empty so we don't crash before it's provided in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

exports.streamChat = async (req, res) => {
    try {
        const { sessionId, content } = req.body;
        
        if (!sessionId || !content) {
            return res.status(400).json({ error: 'sessionId and content are required' });
        }

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (!session || session.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Save user message
        await prisma.message.create({
            data: { sessionId, role: 'user', content }
        });

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Format history for Gemini
        const history = session.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        if (!process.env.GEMINI_API_KEY) {
            res.write(`data: ${JSON.stringify({ text: "Error: GEMINI_API_KEY is not set in backend environment variables." })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ history });

        const result = await chat.sendMessageStream(content);
        
        let fullAiResponse = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullAiResponse += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        // Save AI response
        await prisma.message.create({
            data: { sessionId, role: 'ai', content: fullAiResponse }
        });

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Error generating response' })}\n\n`);
        res.end();
    }
};
