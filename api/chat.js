import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log the API key to ensure it's being loaded correctly (remove this in production)
console.log('API Key:', process.env.OPENAI_API_KEY);

const systemMessage = {
  role: 'system',
  content: 'You are an advanced chatbot with expertise in home remodeling and design. You guide users through their home remodel design process by asking questions about their needs and preferences, providing personalized deliverables. Use examples and evidence to support your recommendations or solutions.'
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // Set timeout to 60 seconds
});

const openai = new OpenAIApi(configuration);

const welcomeMessage = "Welcome to Home Remodel Assistant! I'm here to help you design your dream home. Let's start by telling me which room you would like to remodel first? (1) Kitchen (2) Living Room (3) Bedroom (4) Bathroom";

async function createChatCompletion(messages) {
  return openai.createChatCompletion({
    model: 'gpt-4',
    messages,
    max_tokens: 150, // Limit the response to 150 tokens
  });
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, isInitial } = req.body;

  console.log('Received message:', message);
  console.log('Is initial request:', isInitial);

  if (typeof isInitial === 'undefined') {
    return res.status(400).json({ error: 'isInitial flag is required' });
  }

  if (!message && !isInitial) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (isInitial) {
    return res.status(200).json({ message: welcomeMessage });
  }

  try {
    console.log('Sending request to OpenAI API');
    const response = await createChatCompletion([
      systemMessage,
      { role: 'user', content: message },
    ]);
    console.log('Received response from OpenAI API');

    const botMessage = response.data.choices[0]?.message?.content;
    if (!botMessage) {
      throw new Error('Invalid response from OpenAI API');
    }

    res.status(200).json({ message: botMessage });
  } catch (error) {
    console.error('Error creating chat completion:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'A server error occurred. Please try again later.' });
  }
};
