const {ApiPromise, WsProvider} = require('@polkadot/api');
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const R = require('ramda');
const dayjs = require('dayjs');
const {Keyring} = require('@polkadot/keyring');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const toHex = (s) => {
    var s = unescape(encodeURIComponent(s))
    var h = '0x'
    for (var i = 0; i < s.length; i++) {
        h += s.charCodeAt(i).toString(16)
    }
    return h
}


const generate = (delta, cnt, avg, drop, nProb, nMin, nMax) => {
    const createVal = () => {
        if (Math.random() > nProb) {
            return Math.floor(Math.random() * (nMax - nMin) + nMin)
        } else {
            return Math.floor(
                Math.random() * drop * (Math.random() > 0.5 ? -1 : 1) + avg
            )
        }
    }
    const rets = []
    R.times(i => {
        rets.push(createVal())
        avg += delta
    }, cnt)
    return rets
}

const generateData = () => {
    const length = 30
    const startDate = dayjs().startOf("year")
    const data = generate(0, length, 50, 10, 0.9, 0, 100)
    const labels = R.times(i => startDate.add(i, "day").format("MMM DD"), length)
    const districtNames = R.times(i => `District ${i + 1}`, 13)
    const streetNames = R.times(i => `Street ${i + 1}`, 8)
    const buildingNames = R.times(i => `Building ${i + 1}`, 5)
    const apartmentNames = R.times(i => `Apartment ${i + 1}`, 3)
    const smartCity = {
        name: "Smart City 1",
        type: "city",
        districts: districtNames.map(districtName => {
            return {
                name: districtName,
                type: "district",
                streets: streetNames.map(streetName => {
                    return {
                        name: streetName,
                        type: "street",
                        buildings: buildingNames.map(buildingName => {
                            return {
                                name: buildingName,
                                type: "building",
                                apartments: apartmentNames.map(apartmentName => {
                                    return {
                                        type: "apartment",
                                        name: apartmentName,
                                        data: generate(0, length, 50, 10, 0.9, 0, 100)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    return  JSON.stringify(smartCity);
}

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create(provider);
    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice')
    const data = generateData();
    fs.writeFile('data.json', data, 'utf8', function () {
        const dataFile = fs.readFileSync("data.json");
        const dataBuffer = new Buffer(dataFile);
        ipfs.files.add(dataBuffer, (err, file) => {
            if (err) {
                console.log(err);
            }
            api.tx.robonomics.sendData(toHex(file[0].hash)).signAndSend(alice).then(function () {
                console.log('sended');
            });
        })
    });

}

setInterval(function () {
    main();
}, 5000);
