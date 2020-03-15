const jwt   = require('jsonwebtoken');

// import model
const { Token } = require("../db/models/Token");

const createToken = (user,duration) => {
    return jwt.sign(user, process.env.JWT_KEY,
        {
            expiresIn : duration
        });
}

const createRefreshToken = (user) => {
    const refToken =  jwt.sign(user, process.env.REFRESH_KEY);
    
    Token.findOneAndDelete({ email: user.email})
    .then(emp => {
        if(emp){
            console.log('Deleted Refresh token')
            const newRefToken = new Token({
                email       : emp.email,
                token       : refToken
            })
            newRefToken.save()
                .then(() => console.log('Succesfully saved refresh token'))
                .catch(err => console.error(err))
        } else {
        if(!emp){
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
