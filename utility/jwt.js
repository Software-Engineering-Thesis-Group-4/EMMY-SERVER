const jwt   = require('jsonwebtoken');

// import utility
const { encrypt,decrypter } = require('../utility/aes');

// import model
const { Token } = require("../db/models/Token");

const createToken = (user) => {
    return jwt.sign(user, process.env.JWT_KEY,
        {
            expiresIn : '10s'
        })
}

const createRefreshToken = (user) => {
    const refToken =  jwt.sign(user, process.env.REFRESH_KEY);
    console.log(`user in jwt ${user.role}`)
    const newRefToken = new Token({
        email       : user.email,
        username    : user.username,
        token       : refToken,
        role		: user.role
    })
    newRefToken.save()
        .then(() => console.log('Succesfully saved refresh token'))
        .catch(err => console.error(err))
}

module.exports = { 
    createToken,
    createRefreshToken
  }
