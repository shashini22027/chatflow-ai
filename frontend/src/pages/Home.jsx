import { useState, useEffect, useRef } from 'react';
import { Menu, Plus, MessageSquare, Send, Copy, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchSessions();
        }
    }, [user, navigate]);

    useEffect(() => {
        if (currentSessionId) {
            fetchMessages(currentSessionId);
        } else {
            setMessages([]);
        }
    }, [currentSessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/chats');
            setSessions(res.data);
            if (res.data.length > 0 && !currentSessionId) {
                setCurrentSessionId(res.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching sessions', error);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await api.get(`/chats/${id}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error('Error fetching messages', error);
        }
    };

    const handleNewChat = async () => {
        try {
            const res = await api.post('/chats', { title: 'New Chat' });
            setSessions([res.data, ...sessions]);
            setCurrentSessionId(res.data.id);
        } catch (error) {
            console.error('Error creating chat', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
            try {
                const res = await api.post('/chats', { title: input.substring(0, 30) });
                setSessions([res.data, ...sessions]);
                activeSessionId = res.data.id;
                setCurrentSessionId(activeSessionId);
            } catch (error) {
                console.error('Error creating chat', error);
                return;
            }
        }

        const userMsg = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const response = await fetch('http://localhost:5000/api/chats/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: activeSessionId, content: userMsg.content })
            });
            
            // Temporary mock response for UI until SSE is integrated completely
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: 'Streaming integration pending...' }]);
            }, 500);

        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden text-textMain">
            {/* Sidebar */}
            <div className={`bg-surface border-r border-gray-800 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 hidden md:flex md:w-20'} `}>
                <div className="p-4 flex items-center justify-between border-b border-gray-800">
                    <h1 className={`font-bold text-xl text-primary truncate transition-opacity duration-300 ${!sidebarOpen ? 'md:hidden' : 'block'}`}>NeuroChat AI</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg text-textMuted">
                        <Menu size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <button onClick={handleNewChat} className="w-full flex items-center gap-3 p-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20">
                        <Plus size={20} className="shrink-0" />
                        <span className={`truncate font-medium ${!sidebarOpen ? 'md:hidden' : 'block'}`}>New Chat</span>
                    </button>
                    
                    <div className="mt-6 space-y-1">
                        <div className={`text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 px-2 ${!sidebarOpen ? 'md:hidden' : 'block'}`}>Recent</div>
                        {sessions.map(session => (
                            <button 
                                key={session.id} 
                                onClick={() => setCurrentSessionId(session.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group ${currentSessionId === session.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                            >
                                <MessageSquare size={20} className="text-textMuted shrink-0 group-hover:text-textMain transition-colors" />
                                <span className={`truncate text-sm ${!sidebarOpen ? 'md:hidden' : 'block'}`}>{session.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800">
                    <div className={`mb-4 px-3 text-sm text-textMuted truncate ${!sidebarOpen ? 'md:hidden' : 'block'}`}>
                        {user?.name}
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left text-red-400 hover:text-red-300">
                        <LogOut size={20} className="shrink-0" />
                        <span className={`truncate text-sm font-medium ${!sidebarOpen ? 'md:hidden' : 'block'}`}>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-gray-800 flex items-center gap-3 bg-surface">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg text-textMuted">
                        <Menu size={20} />
                    </button>
                    <h1 className="font-bold text-xl text-primary">NeuroChat AI</h1>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto animate-slide-up">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                                <MessageSquare size={32} className="text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold mb-3">How can I help you today?</h2>
                            <p className="text-textMuted">Experience the power of real-time AI conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-gray-800 rounded-bl-none'}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    {msg.role === 'ai' && (
                                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700/50">
                                            <button className="text-textMuted hover:text-textMain transition-colors" title="Copy">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t border-gray-800">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end bg-surface border border-gray-700 rounded-xl shadow-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all p-1">
                        <textarea 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Message NeuroChat..."
                            className="w-full bg-transparent text-textMain rounded-lg px-4 py-3 focus:outline-none resize-none max-h-32"
                            rows={1}
                            style={{ minHeight: '52px' }}
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim()}
                            className="p-3 m-1 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors shrink-0"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="text-center text-xs text-textMuted mt-3">NeuroChat can make mistakes. Consider verifying important information.</p>
                </div>
            </div>
        </div>
    );
}
