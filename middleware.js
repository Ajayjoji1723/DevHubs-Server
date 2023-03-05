const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
    try{
        let token = req.header('x-token');
        if(!token){
            return res.status(400).send('JWT Token Not Found')
        }
        let compareJwt = jwt.verify(token, 'jwtPassword');
        req.user = compareJwt.user;
        next()
    }catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
}