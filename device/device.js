const { ApiPromise, WsProvider } = require('@polkadot/api');
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const { Keyring } = require('@polkadot/keyring');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const toHex = (s) => {
    var s = unescape(encodeURIComponent(s))
    var h = '0x'
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}

async function main () {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create(provider);
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    const dataFile = fs.readFileSync("data.json");
    const dataBuffer = new Buffer(dataFile);

    ipfs.files.add(dataBuffer, (err, file) => {
        if (err) {
            console.log(err);
        }
        api.tx.robonomics.sendData(toHex(file[0].hash)).signAndSend(alice).then(function () {
            console.log('sended');
            process.exit(1);
        });
    })


}

main();