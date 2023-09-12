const jwt = require('jsonwebtoken');
const jwtSecret = 'Abhi@wesome'

const fetchuser = (req,res,next) => {
    const token = req.header('auth-token')
    if(!token){
        res.status(401).json({Error: 'Kindly provide valid auth-token to authenticate'})
    }

    try{
        const data = jwt.verify(token, jwtSecret)
        req.user = data.user
        next();
    }catch(err){
        console.error(err.message)
        res.status(401).json({Error: 'Kindly provide valid auth-token to authenticate'})
    }
}
module.exports = fetchuser