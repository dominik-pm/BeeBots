"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptToJSON = exports.encryptJSON = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc';
const iv = crypto_1.default.randomBytes(16);
function encryptJSON(obj) {
    let textToEncrypt = '';
    try {
        textToEncrypt = JSON.stringify(obj);
    }
    catch {
        throw ('encryptJSON: invalid json object');
    }
    let res;
    try {
        res = encrypt(Buffer.from(textToEncrypt, 'utf-8'));
    }
    catch (err) {
        console.log(err);
        throw ('encryptJSON: error while trying to encryt');
    }
    return res;
}
exports.encryptJSON = encryptJSON;
function decryptToJSON(encrypted) {
    let decryptedString = '';
    try {
        decryptedString = decrypt(encrypted);
    }
    catch (err) {
        console.log(err);
        throw ('decryptToJSON: error while trying to decrypt');
    }
    let jsonObj = {};
    try {
        jsonObj = JSON.parse(decryptedString);
    }
    catch {
        console.log('decryptToJSON: could not parse to json!');
        console.log(decryptedString);
        return {};
    }
    return jsonObj;
}
exports.decryptToJSON = decryptToJSON;
function encrypt(text) {
    let cipher = crypto_1.default.createCipheriv(algorithm, Buffer.from(getKey()), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    let res = {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    };
    return res;
}
function decrypt(encrypted) {
    let iv = Buffer.from(encrypted.iv, 'hex');
    let decipher = crypto_1.default.createDecipheriv(algorithm, Buffer.from(getKey()), iv);
    let encryptedText = Buffer.from(encrypted.encryptedData, 'hex');
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
let savedKey = undefined;
function getKey() {
    if (savedKey) {
        return savedKey;
    }
    // read secret key
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw ('Could not load access token!');
    }
    // the encryption key has to be 32 bytes long
    const key = secret.substring(0, 32).padEnd(32, secret); //crypto.randomBytes(32);
    savedKey = key;
    return savedKey;
}
