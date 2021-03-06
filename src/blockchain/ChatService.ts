import { BLOCKCHAIN, GTX } from "./Postchain";
import { Chat, ChatMessage, ChromunityUser } from "../types";
import { gaRellOperationTiming } from "../GoogleAnalytics";
import { createStopwatchStarted, handleGADuringException, stopStopwatch, uniqueId } from "../util/util";
import * as BoomerangCache from "boomerang-cache";

const UNREAD_CHATS_KEY = "unreadChats";

const chatCache = BoomerangCache.create("chat-bucket", {
  storage: "session",
  encrypt: false
});

export function getUserPubKey(username: string): Promise<string> {
  return GTX.query("get_chat_user_pubkey", { username: username });
}

export function createChatUser(user: ChromunityUser, pubKey: Buffer) {
  const operation = "create_chat_user";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc
      .transactionBuilder()
      .addOperation(operation, user.ft3User.authDescriptor.hash().toString("hex"), user.name, pubKey)
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  )
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function deleteChatUser(user: ChromunityUser) {
  const operation = "delete_chat_user";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc
      .transactionBuilder()
      .addOperation(operation, user.ft3User.authDescriptor.hash().toString("hex"), user.name)
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  )
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function createNewChat(user: ChromunityUser, chatId: string, encryptedChatKey: string) {
  const operation = "create_chat";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      chatId,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      "Untitled",
      encryptedChatKey
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function sendChatMessage(user: ChromunityUser, chatId: string, message: string) {
  const operation = "send_chat_message";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc
      .transactionBuilder()
      .addOperation(operation, chatId, user.ft3User.authDescriptor.hash().toString("hex"), user.name, message)
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  )
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function addUserToChat(user: ChromunityUser, chatId: string, targetUser: string, encryptedChatKey: string) {
  const operation = "add_user_to_chat";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      chatId,
      targetUser,
      encryptedChatKey
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function leaveChat(user: ChromunityUser, chatId: string) {
  const operation = "leave_chat";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(user.ft3User, operation, user.ft3User.authDescriptor.hash().toString("hex"), user.name, chatId);
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}
export function markChatAsRead(user: ChromunityUser, chatId: string) {
  chatCache.remove(UNREAD_CHATS_KEY);
  const operation = "update_last_opened_timestamp";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc =>
    bc
      .transactionBuilder()
      .addOperation(operation, chatId, user.ft3User.authDescriptor.hash().toString("hex"), user.name)
      .addOperation("nop", uniqueId())
      .build(user.ft3User.authDescriptor.signers)
      .sign(user.ft3User.keyPair)
      .post()
  )
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function modifyTitle(user: ChromunityUser, chatId: string, updatedTitle: string) {
  const operation = "modify_chat_title";

  const sw = createStopwatchStarted();
  return BLOCKCHAIN.then(bc => {
    return bc.call(
      user.ft3User,
      operation,
      user.ft3User.authDescriptor.hash().toString("hex"),
      user.name,
      chatId,
      updatedTitle
    );
  })
    .then((promise: unknown) => {
      gaRellOperationTiming(operation, stopStopwatch(sw));
      return promise;
    })
    .catch(error => handleGADuringException(operation, sw, error));
}

export function getUserChats(username: string): Promise<Chat[]> {
  return GTX.query("get_user_chats", { username: username });
}

export function getChatMessages(id: string, priorTo: number, pageSize: number): Promise<ChatMessage[]> {
  return GTX.query("get_chat_messages", { id: id, prior_to: priorTo, page_size: pageSize }).then(
    (messages: ChatMessage[]) => messages.reverse()
  );
}

export function getChatMessagesAfterTimestamp(
  id: string,
  afterTimestamp: number,
  pageSize: number
): Promise<ChatMessage[]> {
  return GTX.query("get_chat_messages_after", { id: id, after_timestamp: afterTimestamp, page_size: pageSize });
}

export function getChatParticipants(id: string): Promise<string[]> {
  return GTX.query("get_chat_participants", { id: id });
}

export function getFollowedChatUsers(username: string): Promise<string[]> {
  return GTX.query("get_followed_chat_users", { username: username });
}

export function getChatUsers(): Promise<string[]> {
  return GTX.query("get_chat_users", {});
}

export function countUnreadChats(username: string): Promise<number> {
  const count = chatCache.get(UNREAD_CHATS_KEY);

  return count != null
    ? new Promise<number>(resolve => resolve(count))
    : GTX.query("count_unread_chats", { username: username }).then((count: number) => {
        chatCache.set(UNREAD_CHATS_KEY, count, 60);
        return count;
      });
}
