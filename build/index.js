"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.rooms = exports.wss = void 0;
const ws_1 = require("ws");
const Generic_1 = require("./models/Generic");
const helpers_1 = require("./helpers");
const crypto_1 = __importDefault(require("crypto"));
exports.wss = new ws_1.WebSocketServer({ port: 8080 });
exports.rooms = new Map();
exports.users = new Map();
exports.wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const message = (0, helpers_1.convertMessageRecieve)(data);
        if (message.type === Generic_1.IWSMessageType.USER_INFO) {
            const payload = message.data;
            const newUser = Object.assign(Object.assign({}, payload), { id: crypto_1.default.randomUUID() });
            exports.users.set(ws, newUser);
            const payloadToSend = {
                user: newUser
            };
            ws.send((0, helpers_1.convertMessageSend)({ type: Generic_1.IWSMessageType.USER_INFO, data: payloadToSend }));
        }
        if (message.type === Generic_1.IWSMessageType.CREATE_NEW_ROOM) {
            const newRoomId = crypto_1.default.randomUUID();
            const newRoom = { id: newRoomId, messages: [], users: [ws] };
            exports.rooms.set(newRoom.id, newRoom);
            const payload = {
                room: {
                    id: newRoomId,
                    messages: []
                }
            };
            const notificationPayload = {
                content: 'Created a new room with id - ' + newRoomId
            };
            ws.send((0, helpers_1.convertMessageSend)({ type: Generic_1.IWSMessageType.CREATE_NEW_ROOM, data: payload }));
            ws.send((0, helpers_1.convertMessageSend)({ type: Generic_1.IWSMessageType.NOTIFICATION, data: notificationPayload }));
        }
        if (message.type === Generic_1.IWSMessageType.JOIN_ROOM) {
            const payload = message.data;
            const room = exports.rooms.get(payload.roomId);
            if (room && !room.users.includes(ws)) {
                room.users.push(ws);
                const payload = {
                    room: {
                        id: room.id,
                        messages: room.messages
                    }
                };
                ws.send((0, helpers_1.convertMessageSend)({ type: Generic_1.IWSMessageType.JOIN_ROOM, data: payload }));
                const notificationPayload = {
                    content: `Successfully joined room`
                };
                ws.send((0, helpers_1.convertMessageSend)({ type: Generic_1.IWSMessageType.NOTIFICATION, data: notificationPayload }));
            }
            if (!room) {
                const notificationPayload = {
                    content: `Room with given ID doesn't exist`
                };
                ws.send((0, helpers_1.convertMessageSend)({ type: Generic_1.IWSMessageType.NOTIFICATION, data: notificationPayload }));
            }
        }
        if (message.type === Generic_1.IWSMessageType.NEW_MESSAGE) {
            const payload = message.data;
            const room = exports.rooms.get(payload.roomId);
            if (room) {
                room.messages.push(payload.message);
                const payloadToSend = {
                    roomId: room.id,
                    message: payload.message
                };
                (0, helpers_1.broadcastToRoom)(room.id, { type: Generic_1.IWSMessageType.NEW_MESSAGE, data: payloadToSend });
            }
        }
    });
    ws.on('error', console.error);
});
