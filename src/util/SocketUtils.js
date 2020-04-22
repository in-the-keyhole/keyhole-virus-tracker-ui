import openSocket from 'socket.io-client';
import { config } from './socketConfig.js';

const socket = openSocket(config.apiserver);

function subscribeToBlocks(cb) {
  socket.on('blocks', blocks => cb(null, blocks));
  socket.emit('subscribeToBlocks', 1000);
}

export { subscribeToBlocks };