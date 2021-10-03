

function currentTime() {
    return new Date().toTimeString().split(' ')[0];
}

module.exports = {
    currentTime
}