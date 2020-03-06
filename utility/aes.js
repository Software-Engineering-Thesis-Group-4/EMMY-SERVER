const aesjs     = require('aes-js');
const envKey    = process.env.AES_KEY;
const key       = envKey.split(',');

for(var i=0; i < key.length; i++){
    key[i] = parseInt(key[i]);
}

const encrypt = (text) => {

    
    const textBytes = aesjs.utils.utf8.toBytes(text);
    
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    const encryptedBytes = aesCtr.encrypt(textBytes);
    
    // To print or store the binary data, you may convert it to hex
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
}

const decrypter = (text) => {
    

    // When ready to decrypt the hex string, convert it back to bytes
    var encryptedBytes = aesjs.utils.hex.toBytes(text);
    
    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    
    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;

}

const decrypt = (employeeList) => {

    employeeList.forEach(element => {
        element.employeeId      = decrypter(element.employeeId);
        element.firstName       = decrypter(element.firstName);
        element.lastName        = decrypter(element.lastName);
        element.email           = decrypter(element.email);
        element.fingerprintId   = decrypter(element.fingerprintId);
    });
    
    return employeeList;
}

module.exports = {
    encrypt,
    decrypt,
    decrypter
}
