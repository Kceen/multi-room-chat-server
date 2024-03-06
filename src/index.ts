import { WebSocketServer, WebSocket } from 'ws'
import { IRoom, IUser, IWSMessageType } from './models/Generic'
import { broadcastToRoom, convertMessageRecieve, convertMessageSend } from './helpers'
import {
  I_JOIN_ROOM_ClientPayload,
  I_NEW_MESSAGE_ClientPayload,
  I_USER_INFO_ClientPayload
} from './models/Payload/Client'
import crypto from 'crypto'
import {
  I_CREATE_NEW_ROOM_ServerPayload,
  I_JOIN_ROOM_ServerPayload,
  I_NEW_MESSAGE_ServerPayload,
  I_NOTIFICATION_ServerPayload,
  I_USER_INFO_ServerPayload
} from './models/Payload/Server'

export const wss = new WebSocketServer({ port: 8080 })

export const rooms = new Map<string, IRoom>()
export const users = new Map<WebSocket, IUser>()

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = convertMessageRecieve(data)

    if (message.type === IWSMessageType.USER_INFO) {
      const payload: I_USER_INFO_ClientPayload = message.data
      const newUser: IUser = { ...payload, id: crypto.randomUUID() }

      users.set(ws, newUser)

      const payloadToSend: I_USER_INFO_ServerPayload = {
        user: newUser
      }
      ws.send(convertMessageSend({ type: IWSMessageType.USER_INFO, data: payloadToSend }))
    }

    if (message.type === IWSMessageType.CREATE_NEW_ROOM) {
      const newRoomId = crypto.randomUUID()
      const newRoom: IRoom = { id: newRoomId, messages: [], users: [ws] }

      rooms.set(newRoom.id, newRoom)

      const payload: I_CREATE_NEW_ROOM_ServerPayload = {
        room: {
          id: newRoomId,
          messages: []
        }
      }

      const notificationPayload: I_NOTIFICATION_ServerPayload = {
        content: 'Created a new room with id - ' + newRoomId
      }

      ws.send(convertMessageSend({ type: IWSMessageType.CREATE_NEW_ROOM, data: payload }))
      ws.send(convertMessageSend({ type: IWSMessageType.NOTIFICATION, data: notificationPayload }))
    }

    if (message.type === IWSMessageType.JOIN_ROOM) {
      const payload: I_JOIN_ROOM_ClientPayload = message.data

      const room = rooms.get(payload.roomId)

      if (room && !room.users.includes(ws)) {
        room.users.push(ws)

        const payload: I_JOIN_ROOM_ServerPayload = {
          room: {
            id: room.id,
            messages: room.messages
          }
        }
        ws.send(convertMessageSend({ type: IWSMessageType.JOIN_ROOM, data: payload }))

        const notificationPayload: I_NOTIFICATION_ServerPayload = {
          content: `Successfully joined room`
        }
        ws.send(
          convertMessageSend({ type: IWSMessageType.NOTIFICATION, data: notificationPayload })
        )
      }

      if (!room) {
        const notificationPayload: I_NOTIFICATION_ServerPayload = {
          content: `Room with given ID doesn't exist`
        }
        ws.send(
          convertMessageSend({ type: IWSMessageType.NOTIFICATION, data: notificationPayload })
        )
      }
    }

    if (message.type === IWSMessageType.NEW_MESSAGE) {
      const payload: I_NEW_MESSAGE_ClientPayload = message.data

      const room = rooms.get(payload.roomId)

      if (room) {
        room.messages.push(payload.message)

        const payloadToSend: I_NEW_MESSAGE_ServerPayload = {
          roomId: room.id,
          message: payload.message
        }
        broadcastToRoom(room.id, { type: IWSMessageType.NEW_MESSAGE, data: payloadToSend })
      }
    }
  })

  ws.on('error', console.error)
})
