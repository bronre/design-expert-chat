import React, { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();
    setMessages([...messages, { user: input, bot: data.message }]);
    setInput('');
  };

  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.user ? 'user' : 'bot'}`}>
          <strong>{msg.user ? 'User:' : 'Bot:'}</strong> {msg.user ? msg.user : msg.bot}
        </div>
      ))}
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
