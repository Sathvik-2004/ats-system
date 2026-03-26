import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

let socketInstance = null;

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(API_URL, {
      autoConnect: false,
      transports: ['websocket'],
      auth: { token }
    });
  }

  const currentToken = socketInstance.auth?.token;
  if (currentToken !== token) {
    socketInstance.auth = { token };
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
};