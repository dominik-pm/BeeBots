let reqCount = 0;

function logTime(req, res, next) {
    console.log(`\n---- REQUEST ${++reqCount} START ----`);

    console.log(`${req.method} ${req.url} requested from ${req.hostname} (${req.ip}) via ${req.protocol} at ${currentTime()}!`);
    
    console.log('incoming data:');
    console.log(req.body);

    logResponse(res, (resBody) => {
        console.log(`responding with:`)
        console.log(resBody);
    });

    next();

    console.log(`---- REQUEST ${reqCount} END ----\n`);
}

// returns the current formatted time
function currentTime() {
    return new Date().toTimeString().split(' ')[0];
}

// is called when an error occures (by script error or throw)
function logErr(err, req, res, next) {
    // expected error (400)
    if (err.status) {
        console.log(err.message)
        res.status(err.status).json({status: err.status, message: err.message})
    } 
    // unexpected error (500)
    else {
        console.error(err);
        res.status(530).json({message: 'internal server error'})
    }
}

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

        // console.log({
        //     time: new Date().toUTCString(),
        //     fromIP: req.headers['x-forwarded-for'] || 
        //     req.connection.remoteAddress,
        //     method: req.method,
        //     originalUri: req.originalUrl,
        //     uri: req.url,
        //     requestData: req.body,
        //     responseData: body,
        //     referer: req.headers.referer || '',
        //     ua: req.headers['user-agent']
        // });

        callback(JSON.parse(body));
        oldEnd.apply(res, restArgs);
    };
}

module.exports = {
    logTime, logErr
}