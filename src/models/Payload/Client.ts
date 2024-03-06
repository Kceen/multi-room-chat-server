import { IMessage } from '../Generic'

export interface I_USER_INFO_ClientPayload {
  name: string
}

export interface I_JOIN_ROOM_ClientPayload {
  roomId: string
}

export interface I_NEW_MESSAGE_ClientPayload {
  roomId: string
  message: IMessage
}
