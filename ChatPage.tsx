import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (!user && count >= 10) {
      setShowModal(true);
      return;
    }

    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
    setLoading(true);
    
    if (!user) setCount(prev => prev + 1);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: user?.uid }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Error occurred. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="border-b px-4 py-3 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <h1 className="text-xl font-bold">Kora</h1>
          {!user && <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{count}/10 messages</span>}
        </div>
        {user ? (
          <button onClick={logout} className="text-sm px-4 py-2 hover:bg-gray-100 rounded">Logout</button>
        ) : (
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Sign In</button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center my-20">
              <h2 className="text-4xl font-bold mb-4">Hi, I'm Kora</h2>
              <p className="text-lg text-gray-600">How can I help you today?</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl rounded-2xl px-4 py-3 ${
                    m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}>
                    {m.role === 'assistant' && <div className="text-xs font-semibold text-gray-600 mb-1">Kora</div>}
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Kora</div>
                    <div className="flex gap-1">
                      {[0, 150, 300].map(delay => (
                        <div key={delay} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: `${delay}ms`}} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Message Kora..."
            className="flex-1 px-4 py-3 border rounded-full resize-none focus:outline-none focus:border-blue-500"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between mb-6">
              <h3 className="text-2xl font-bold">Sign In to Continue</h3>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-400">×</button>
            </div>
            <p className="text-gray-600 mb-6">You've reached the free message limit. Sign in to continue.</p>
            <button
              onClick={async () => { await signInWithGoogle(); setShowModal(false); }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
