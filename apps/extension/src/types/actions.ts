export const ExtensionAction = {
    PING: "ping",
    SYNC_USER_AUTH: "SYNC_USER_AUTH",
    SYNC_USER_LOGOUT: "SYNC_USER_LOGOUT",
    SYNC_VAULT_UNLOCK: "SYNC_VAULT_UNLOCK",
    SYNC_VAULT_LOCK: "SYNC_VAULT_LOCK",
    GET_SESSION_STATE: "GET_SESSION_STATE",
    GET_CREDENTIALS: "GET_CREDENTIALS",
    GET_ALL_VAULTS: "GET_ALL_VAULTS",
    UNLOCK_AND_GET_CREDENTIAL: "UNLOCK_AND_GET_CREDENTIAL",
    SAVE_CREDENTIAL: "SAVE_CREDENTIAL",
    OPEN_AUTO_POPUP: "OPEN_AUTO_POPUP",
    CLOSE_PROMPT: "CLOSE_PROMPT",
    PROMPT_READY: "PROMPT_READY",
    FORCE_AUTOFILL: "FORCE_AUTOFILL"
} as const;

export type ExtensionAction = typeof ExtensionAction[keyof typeof ExtensionAction];

export interface MessagePayload {
    action: ExtensionAction;
    payload?: any;
    hostname?: string;
}
