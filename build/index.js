"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const models_1 = require("./models");
const helpers_1 = require("./helpers");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const rooms = new Map();
const users = new Map();
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const message = (0, helpers_1.convertMessageRecieve)(data);
        if (message.type === models_1.IWSMessageType.USER_INFO) {
            users.set(ws, message.data);
        }
        if (message.type === models_1.IWSMessageType.CREATE_NEW_ROOM) {
            const newRoomId = message.data.roomId;
            if (rooms.get(newRoomId)) {
                return;
            }
            rooms.set(newRoomId, {
                id: newRoomId,
                users: [ws],
                messages: []
            });
            ws.send((0, helpers_1.convertMessageSend)({
                type: models_1.IWSMessageType.JOIN_ROOM,
                data: { roomId: newRoomId }
            }));
        }
        if (message.type === models_1.IWSMessageType.NEW_MESSAGE) {
            const data = message.data;
            const user = users.get(ws);
            const room = rooms.get(data.roomId);
            room === null || room === void 0 ? void 0 : room.messages.push({ content: data.content, user: user });
            broadcastToRoom(room.id, {
                type: models_1.IWSMessageType.NEW_MESSAGE,
                data: { content: data.content, user }
            });
        }
        if (message.type === models_1.IWSMessageType.JOIN_ROOM) {
            const data = message.data;
            const room = rooms.get(data.roomId);
            const userAlreadyInRoom = room === null || room === void 0 ? void 0 : room.users.includes(ws);
            if (room && !userAlreadyInRoom) {
                room.users.push(ws);
                ws.send((0, helpers_1.convertMessageSend)({
                    type: models_1.IWSMessageType.JOIN_ROOM,
                    data: { roomId: room.id }
                }));
            }
        }
    });
    ws.on('error', console.error);
});
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send((0, helpers_1.convertMessageSend)(data));
        }
    });
}
function broadcastToRoom(roomId, data) {
    const room = rooms.get(roomId);
    room === null || room === void 0 ? void 0 : room.users.forEach((user) => {
        if (user.readyState === ws_1.WebSocket.OPEN) {
            user.send((0, helpers_1.convertMessageSend)(data));
        }
    });
}
