// api/chat.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const botMessage = response.choices[0].message.content;
    if (!botMessage) {
      throw new Error('Invalid response from OpenAI API');
    }

    res.status(200).json({ message: botMessage });
  } catch (error) {
    console.error('Error creating chat completion:', error);
    res.status(500).json({ error: 'A server error occurred. Please try again later.' });
  }
};
