import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial greeting and instructions
      setMessages([
        { role: 'bot', content: 'Hello! I am your design remodel expert. Let’s get started with your project.' },
        { role: 'bot', content: 'What room are you looking to remodel? (e.g., kitchen, bathroom, living room)' }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async () => {
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/chat', { message: input });
      const { message: botMessage } = response.data;

      // Handle follow-up messages (if any)
      const followUpMessages = response.data.followUpMessages || [];

      setMessages([...newMessages, { role: 'bot', content: botMessage }, ...followUpMessages]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { role: 'bot', content: 'Error: Unable to get response from API' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Bot is typing...</div>}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
