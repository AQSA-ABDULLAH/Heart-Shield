const jwt = require('jsonwebtoken');
const UserModel = require("../models/Users.js");
const isAdmin = async(req,res,next)=>{
    try{
        const user = await UserModel.findById(req.users._id);
        if(user.role !== 1){
            return res.status(401).send({
                success:false,
                message:'UnAuthorized Access'
            })
        }
        else{
            next()
        }
    }
    catch(error){
        console.log(error)
    }
}
module.exports = { isAdmin };
