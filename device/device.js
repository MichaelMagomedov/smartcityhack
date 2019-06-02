const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

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
    api.tx.robonomics.sendData(toHex('Hello world')).signAndSend(alice);
}

console.log(main());