import { writable, readable } from 'svelte/store';
import { io } from 'socket.io-client';

const _socket = io('http://localhost:3000');
_socket.on('connect', () => {
    console.log('Connected to server');
});

export const socket = readable(_socket);  // Adjust the URL as needed for your setup
export const roomId = writable('');

export function joinRoom(id) {
    roomId.set(id);
    socket.emit('join room', id);
}

export default socket;
