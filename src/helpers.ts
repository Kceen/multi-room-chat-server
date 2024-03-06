import { rooms, wss } from '.'
import { IWSMessage } from './models/Generic'
import { WebSocket } from 'ws'

export function convertMessageSend(data: IWSMessage): string {
  return JSON.stringify(data)
}

export function convertMessageRecieve(data: any): IWSMessage {
  return JSON.parse(data.toString())
}

export function broadcast(data: IWSMessage) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(convertMessageSend(data))
    }
  })
}

export function broadcastToRoom(roomId: string, data: IWSMessage) {
  const room = rooms.get(roomId)

  if (room) {
    room.users.forEach((user) => {
      if (user.readyState === WebSocket.OPEN) {
        user.send(convertMessageSend(data))
      }
    })
  }
}
