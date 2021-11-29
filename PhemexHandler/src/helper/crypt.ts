import crypto, { randomBytes } from 'crypto';
import { EncryptionObject } from '../@types/crypt';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

export function encryptJSON(obj: Object): EncryptionObject {
    let textToEncrypt = '';
    try {
        textToEncrypt = JSON.stringify(obj);
    }
    catch {
        throw('encryptJSON: invalid json object');
    }

    let res: EncryptionObject;
    try {
        res = encrypt(Buffer.from(textToEncrypt, 'utf-8'));
    }
    catch (err) {
        console.log(err)
        throw('encryptJSON: error while trying to encryt')
    }
    return res;
}

export function decryptToJSON(encrypted: EncryptionObject): Object {
    let decryptedString = '';
    try {
        decryptedString = decrypt(encrypted);
    }
    catch (err) {
        console.log(err)
        throw('decryptToJSON: error while trying to decrypt')
    }

    let jsonObj = {};
    try {
        jsonObj = JSON.parse(decryptedString);
    }
    catch {
        console.log('decryptToJSON: could not parse to json!')
        console.log(decryptedString);
        return {}
    }

    return jsonObj;
}

function encrypt(text: Buffer): EncryptionObject {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(getKey()), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    let res: EncryptionObject = {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    }
    return res;
}

function decrypt(encrypted: EncryptionObject): string {
    let iv = Buffer.from(encrypted.iv, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(getKey()), iv);
    
    let encryptedText = Buffer.from(encrypted.encryptedData, 'hex');
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

let savedKey: string | undefined = undefined;
function getKey() {
    if (savedKey) {
        return savedKey;
    }

    // read secret key
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw('Could not load access token!')
    }

    // the encryption key has to be 32 bytes long
    const key: string = secret.substring(0, 32).padEnd(32, secret); //crypto.randomBytes(32);
    savedKey = key;
    
    return savedKey;
}