import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const myUsername = 'jsmith';

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:5555', {
      auth: { token: '123' }
    });

    newSocket.on('join', (value) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'info', text: `${value.username} joined the room` }
      ]);
    });

    newSocket.on('leave', (value) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'info', text: `${value.username} left the room` }
      ]);
    });

    newSocket.on('message', (value) => {
      const { username, message } = value;
      const cssClass = username === myUsername ? 'my-message' : 'other-message';
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: cssClass, text: message }
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    socket.emit('message', { username: myUsername, message, room });
    setMessage('');
  };

  const handleJoinRoom = () => {
    if (room.trim() === '') return;
    socket.emit('join', { username: myUsername, room });
    setInRoom(true);
  };

  const handleLeaveRoom = () => {
    socket.emit('leave', { username: myUsername, room });
    setInRoom(false);
    setRoom('');
    setMessages([]);
  };

  return (
    <div className="container">
      {!inRoom ? (
        <div className="controls" id="room-select">
          <input
            id="room-input"
            placeholder="Select room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button id="join-button" onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <div id="room">
          <div id="messages">
            <ul>
              {messages.map((msg, index) => (
                <li key={index} className={msg.type}>{msg.text}</li>
              ))}
            </ul>
          </div>
          <div className="controls">
            <input
              id="message-input"
              placeholder="Add message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button id="send-button" onClick={handleSendMessage}>Send message</button>
            <button id="leave-button" onClick={handleLeaveRoom}>Leave room</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
