declare module 'backend'

export interface BackendBotResponse {
    botsId: number,
    name: string,
    encryptedApikey: string,
    encryptedApisecret: string,
    buyAlgo: number,
    positionAlgo: number,
    isTestNet: number
}