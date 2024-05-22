import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const systemMessage = {
  role: 'system',
  content: 'You are an advanced chatbot with expertise in home remodeling and design, that guides users through their home remodel design process by asking questions about their needs and preferences to provide them with personalized deliverables: Finalized Design Concept, Mood Boards, Detailed Design Plan, Floor Plans, Material and Color Schemes, Shopping List, Furniture and Decor, Materials and Supplies, Project Timeline, Implementation Plan: [PDF document with timeline and milestones], Budget Breakdown, Use examples and evidence to support your points and justify your recommendations or solutions.'
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 80000, // Set timeout to 80 seconds
});

const openai = new OpenAIApi(configuration);

// Welcome message to be sent at the start of the conversation
const welcomeMessage = "Welcome to Home Remodel Assistant! I'm here to help you design your dream home. Let's start by telling me Which room would you like to remodel first?";

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, isInitial } = req.body;

  // Debugging: Log the received message
  console.log('Received message:', message);
  console.log('Is initial request:', isInitial);

  if (typeof isInitial === 'undefined') {
    return res.status(400).json({ error: 'isInitial flag is required' });
  }

  if (!message && !isInitial) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If this is the initial request, send the welcome message
  if (isInitial) {
    return res.status(200).json({ message: welcomeMessage });
  }

  try {
    console.log('Sending request to OpenAI API');
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        systemMessage,
        { role: 'user', content: message },
      ],
      max_tokens: 1000, // Limit the response to 1000 tokens
    });
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
