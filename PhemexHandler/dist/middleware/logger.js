"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErr = exports.logTime = void 0;
let reqCount = 0;
function logTime(req, res, next) {
    console.log(`\n---- REQUEST ${++reqCount} START ----`);
    console.log(`${req.method} ${req.url} requested from ${req.hostname} (${req.ip}) via ${req.protocol} at ${currentTime()}!`);
    console.log('incoming data:');
    console.log(req.body);
    logResponse(res, (resBody) => {
        console.log(`responding with:`);
        console.log(resBody);
        console.log(`---- REQUEST ${reqCount} END ----\n`);
    });
    next();
}
exports.logTime = logTime;
// returns the current formatted time
function currentTime() {
    return new Date().toTimeString().split(' ')[0];
}
// is called when an error occures (by script error or throw)
function logErr(err, req, res, next) {
    // expected error (400)
    if (err.status) {
        console.log(err.message);
        res.status(err.status).json({ status: err.status, message: err.message });
    }
    // unexpected error (500)
    else {
        console.error(err);
        res.status(500).json({ message: 'internal server error' });
    }
}
exports.logErr = logErr;
// does some crazy stuff to callback response data when res is sent
function logResponse(res, callback) {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];
    res.write = (...restArgs) => {
        chunks.push(Buffer.from(restArgs[0]));
        oldWrite.apply(res, restArgs);
    };
    res.end = (...restArgs) => {
        if (restArgs[0]) {
            chunks.push(Buffer.from(restArgs[0]));
        }
        const body = Buffer.concat(chunks).toString('utf8');
        if (isJsonString(body)) {
            callback(JSON.parse(body));
            oldEnd.apply(res, restArgs);
        }
    };
}
function isJsonString(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}
