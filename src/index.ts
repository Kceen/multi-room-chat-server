import { WebSocketServer, WebSocket } from 'ws'
import {
  ICreateNewRoomRequestPayload,
  IJoinedNewRoomResponsePayload,
  IWSMessage,
  IWSMessageType,
  IRoom,
  IUser,
  INewMessagePayload,
  IMessage,
  IJoinRoomRequestPayload
} from './models'
import { convertMessageRecieve, convertMessageSend } from './helpers'

const wss = new WebSocketServer({ port: 8080 })

const rooms = new Map<string, IRoom>()
const users = new Map<WebSocket, IUser>()

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = convertMessageRecieve(data)

    if (message.type === IWSMessageType.USER_INFO) {
      users.set(ws, message.data as IUser)
    }

    if (message.type === IWSMessageType.CREATE_NEW_ROOM) {
      const newRoomId = (message.data as ICreateNewRoomRequestPayload).roomId

      if (rooms.get(newRoomId)) {
        return
      }

      rooms.set(newRoomId, {
        id: newRoomId,
        users: [ws],
        messages: []
      })

      ws.send(
        convertMessageSend({
          type: IWSMessageType.JOIN_ROOM,
          data: { roomId: newRoomId } as IJoinedNewRoomResponsePayload
        })
      )
    }

    if (message.type === IWSMessageType.NEW_MESSAGE) {
      const data = message.data as INewMessagePayload

      const user = users.get(ws)
      const room = rooms.get(data.roomId)

      room?.messages.push({ content: data.content, user: user! })

      broadcastToRoom(room!.id, {
        type: IWSMessageType.NEW_MESSAGE,
        data: { content: data.content, user } as IMessage
      })
    }

    if (message.type === IWSMessageType.JOIN_ROOM) {
      const data = message.data as IJoinRoomRequestPayload

      const room = rooms.get(data.roomId)
      const userAlreadyInRoom = room?.users.includes(ws)

      if (room && !userAlreadyInRoom) {
        room.users.push(ws)

        ws.send(
          convertMessageSend({
            type: IWSMessageType.JOIN_ROOM,
            data: { roomId: room!.id } as IJoinedNewRoomResponsePayload
          })
        )
      }
    }
  })

  ws.on('error', console.error)
})

function broadcast(data: IWSMessage) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(convertMessageSend(data))
    }
  })
}

function broadcastToRoom(roomId: string, data: IWSMessage) {
  const room = rooms.get(roomId)

  room?.users.forEach((user) => {
    if (user.readyState === WebSocket.OPEN) {
      user.send(convertMessageSend(data))
    }
  })
}
