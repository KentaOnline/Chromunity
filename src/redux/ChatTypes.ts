import { Chat, ChatMessageDecrypted, ChromunityUser } from "../types";

export enum ChatActionTypes {
  CHECK_CHAT_AUTH_ACTION = "CHAT/AUTH/CHECK",
  CREATE_CHAT_KEY_PAIR = "CHAT/KEYPAIR/CREATE",
  STORE_CHAT_KEY_PAIR = "CHAT/KEYPAIR/STORE",
  CREATE_NEW_CHAT = "CHAT/CREATE/NEW",
  ADD_USER_TO_CHAT = "CHAT/USER/INVITE",
  LEAVE_CHAT = "CHAT/USER/LEAVE",
  LOAD_USER_CHATS = "CHATS/USER/LOAD",
  STORE_USER_CHATS = "CHATS/USER/STORE",
  OPEN_CHAT = "CHAT/OPEN",
  REFRESH_OPEN_CHAT = "CHAT/REFRESH",
  STORE_DECRYPTED_CHAT = "CHAT/DECRYPTED/STORE",
  SEND_MESSAGE = "CHAT/MESSAGE/SEND"
}

export interface CheckChatAuthenticationAction {
  type: ChatActionTypes.CHECK_CHAT_AUTH_ACTION;
}

export interface CreateChatKeyPairAction {
  type: ChatActionTypes.CREATE_CHAT_KEY_PAIR;
  user: ChromunityUser;
  password: string;
}

export interface StoreChatKeyPairAction {
  type: ChatActionTypes.STORE_CHAT_KEY_PAIR;
  rsaKey: any;
}

export interface CreateNewChatAction {
  type: ChatActionTypes.CREATE_NEW_CHAT;
  user: ChromunityUser;
}

export interface AddUserToChatAction {
  type: ChatActionTypes.ADD_USER_TO_CHAT;
  username: string;
  user: ChromunityUser;
}

export interface LeaveChatAction {
  type: ChatActionTypes.LEAVE_CHAT;
  user: ChromunityUser;
}

export interface LoadUserChatsAction {
  type: ChatActionTypes.LOAD_USER_CHATS;
  force?: boolean;
  user: string;
}

export interface StoreUserChatsAction {
  type: ChatActionTypes.STORE_USER_CHATS;
  chats: Chat[];
}

export interface OpenChatAction {
  type: ChatActionTypes.OPEN_CHAT;
  chat: Chat;
}

export interface RefreshOpenChatAction {
  type: ChatActionTypes.REFRESH_OPEN_CHAT;
  user: string;
}

export interface StoreDecryptedChatAction {
  type: ChatActionTypes.STORE_DECRYPTED_CHAT;
  chat: Chat;
  messages: ChatMessageDecrypted[];
}

export interface SendMessageAction {
  type: ChatActionTypes.SEND_MESSAGE;
  user: ChromunityUser;
  chat: Chat;
  message: string;
}

export type ChatActions =
  | CheckChatAuthenticationAction
  | CreateChatKeyPairAction
  | StoreChatKeyPairAction
  | CreateNewChatAction
  | AddUserToChatAction
  | LoadUserChatsAction
  | StoreUserChatsAction
  | OpenChatAction
  | LeaveChatAction
  | StoreDecryptedChatAction
  | SendMessageAction;

export interface ChatState {
  rsaKey: any;
  successfullyAuthorized: boolean;
  chats: Chat[];
  activeChat: Chat;
  activeChatMessages: ChatMessageDecrypted[];
  lastUpdate: number;
  loading: boolean;
}