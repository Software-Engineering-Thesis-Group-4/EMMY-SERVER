const jwt   = require('jsonwebtoken');

// import model
const { Token } = require("../db/models/Token");

const createToken = (user) => {
    return jwt.sign(user, process.env.JWT_KEY,
        {
            expiresIn : process.env.TOKEN_DURATION
        })
}

const createRefreshToken = (user) => {
    const refToken =  jwt.sign(user, process.env.REFRESH_KEY);
    
    Token.findOneAndDelete({ email: user.email})
    .then(token => {
        if(token){
            console.log('Deleted Refresh token')
            const newRefToken = new Token({
                email       : user.email,
                token       : refToken
            })
            newRefToken.save()
                .then(() => console.log('Succesfully saved refresh token'))
                .catch(err => console.error(err))
        } else {
        if(!token){
            const newRefToken = new Token({
                email       : user.email,
                token       : refToken
            })
            newRefToken.save()
                .then(() => console.log('Succesfully saved refresh token'))
                .catch(err => console.error(err))
        }
        }
    })
}

module.exports = { 
    createToken,
    createRefreshToken
  }
