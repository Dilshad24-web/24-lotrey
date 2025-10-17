import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const history = new Map<string, Array<{role: string, content: string}>>();

async function gemini(msg: string, hist: Array<{role: string, content: string}> = []): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: 'You are Kora, a helpful AI assistant. Always say your name is Kora when asked.'
  });
  const chat = model.startChat({
    history: hist.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] }))
  });
  const result = await chat.sendMessage(msg);
  return result.response.text();
}

async function deepseek(msg: string, hist: Array<{role: string, content: string}> = []): Promise<string> {
  const res = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are Kora, a helpful AI assistant. Always say your name is Kora when asked.' },
      ...hist,
      { role: 'user', content: msg }
    ]
  }, {
    headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` }
  });
  return res.data.choices[0].message.content;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    const hist = userId ? history.get(userId) || [] : [];
    let response = '';
    
    try {
      response = await gemini(message, hist);
    } catch {
      response = await deepseek(message, hist);
    }
    
    if (userId) {
      history.set(userId, [...hist, { role: 'user', content: message }, { role: 'assistant', content: response }].slice(-20));
    }
    
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.listen(3000, () => console.log('✅ Kora server: http://localhost:3000'));
