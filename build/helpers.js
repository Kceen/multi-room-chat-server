"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastToRoom = exports.broadcast = exports.convertMessageRecieve = exports.convertMessageSend = void 0;
const _1 = require(".");
const ws_1 = require("ws");
function convertMessageSend(data) {
    return JSON.stringify(data);
}
exports.convertMessageSend = convertMessageSend;
function convertMessageRecieve(data) {
    return JSON.parse(data.toString());
}
exports.convertMessageRecieve = convertMessageRecieve;
function broadcast(data) {
    _1.wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(convertMessageSend(data));
        }
    });
}
exports.broadcast = broadcast;
function broadcastToRoom(roomId, data) {
    const room = _1.rooms.get(roomId);
    if (room) {
        room.users.forEach((user) => {
            if (user.readyState === ws_1.WebSocket.OPEN) {
                user.send(convertMessageSend(data));
            }
        });
    }
}
exports.broadcastToRoom = broadcastToRoom;
