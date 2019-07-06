import {GTX, PRIV_KEY} from "./Postchain";
import {generatePublicKey, toBuffer, decrypt} from "./CryptoService";
import * as BoomerangCache from "boomerang-cache";
import {User, UserNotification} from "../types";

const boomerang = BoomerangCache.create("notification-bucket", {storage: "local", encrypt: true});

export function sendUserNotifications(fromUser: User, threadId: string, usernames: Set<string>) {
    const privKeyHex = decrypt(PRIV_KEY, fromUser.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    tx.addOperation("createNotification", fromUser.name, threadId, Array.from(usernames));
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function markNotificationsRead(user: User) {
    boomerang.remove("notis-" + user.name);

    const privKeyHex = decrypt(PRIV_KEY, user.encryptedKey);
    const pubKeyHex = generatePublicKey(privKeyHex);

    const privKey = toBuffer(privKeyHex);
    const pubKey = toBuffer(pubKeyHex);

    const tx = GTX.newTransaction([pubKey]);
    const epochSeconds = Math.round(new Date().getTime() / 1000);
    tx.addOperation("markNotificationsSinceTimestampRead", user.name, epochSeconds);
    tx.sign(privKey, pubKey);
    return tx.postAndWaitConfirmation();
}

export function getUserNotifications(user: string): Promise<UserNotification[]> {
    return GTX.query("getAllUserNotifications", { name: user });
}

export function countUnreadUserNotifications(user: string): Promise<number> {
    const count = boomerang.get("notis-" + user);

    if (count == null) {
        return GTX.query('countUnreadUserNotifications', {name: user})
            .then((arr: any[]) => {
                boomerang.set("notis-" + user, arr.length, 60);
                return arr.length;
            });
    } else {
        return new Promise<number>(resolve => resolve(count));
    }
}
