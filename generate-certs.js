const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'California' },
    { name: 'localityName', value: 'San Francisco' },
    { name: 'organizationName', value: 'SynapseCall' },
    { name: 'organizationalUnitName', value: 'Development' }
];

const pems = selfsigned.generate(attrs, {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
        { name: 'basicConstraints', cA: true },
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' }
            ]
        }
    ]
});

const certsPath = path.join(__dirname, 'certs');
if (!fs.existsSync(certsPath)) {
    fs.mkdirSync(certsPath);
}

fs.writeFileSync(path.join(certsPath, 'key.pem'), pems.private);
fs.writeFileSync(path.join(certsPath, 'cert.pem'), pems.cert);

console.log('Certificates generated in certs directory');
