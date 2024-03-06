import { WebSocket } from 'ws'

export interface IUser {
  id: string
  name: string
}

export interface IMessage {
  user: IUser
  content: string
  timestamp: string
}

export interface IRoom {
  id: string
  users: WebSocket[]
  messages: IMessage[]
}

export interface IRoomClient {
  id: string
  messages: IMessage[]
}

export interface IWSMessage {
  type: IWSMessageType
  data?: any
}

export enum IWSMessageType {
  NOTIFICATION = 'NOTIFICATION',
  NEW_MESSAGE = 'NEW_MESSAGE',
  CREATE_NEW_ROOM = 'CREATE_NEW_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  USER_INFO = 'USER_INFO'
}
