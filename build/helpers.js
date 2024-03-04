"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMessageRecieve = exports.convertMessageSend = void 0;
function convertMessageSend(data) {
    return JSON.stringify(data);
}
exports.convertMessageSend = convertMessageSend;
function convertMessageRecieve(data) {
    return JSON.parse(data.toString());
}
exports.convertMessageRecieve = convertMessageRecieve;
