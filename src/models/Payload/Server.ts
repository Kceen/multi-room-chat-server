import { IMessage, IRoomClient, IUser } from '../Generic'

export interface I_NEW_MESSAGE_ServerPayload {
  roomId: string
  message: IMessage
}

export interface I_CREATE_NEW_ROOM_ServerPayload {
  room: IRoomClient
}

export interface I_JOIN_ROOM_ServerPayload {
  room: IRoomClient
}

export interface I_NOTIFICATION_ServerPayload {
  content: string
}

export interface I_USER_INFO_ServerPayload {
  user: IUser
}
