const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
//create user,register user
exports.registerController = async (req,res) => {
    try{
        const {username, email, password} = req.body
        //validation
        if(!username || !email || !password){
            return res.status(400).send({
                success:false,
                message:'Gonna need the creds, sarge.'
            })
        }
        //existing User
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.status(401).send({
                success:false,
                message:'You sure you aint an impostor?'
            })
        }

        const hashedPassword = await bcrypt.hash(password,10)
        //save new user
        const user = new userModel({username, email, password:hashedPassword})
        await user.save()
        return res.status(201).send({
            success: true,
            message: 'Welcome onboard',
            user,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).send({
            message: 'Error in Register callback',
            success: false,
            error
        })
    }
};

//get all users
exports.getAllUsers = async(req,res) =>{
    try{
        const users = await userModel.find({})
        return res.status(200).send({
            userCount : users.length,
            success:true,
            message: 'Startroopers has been summoned.',
            users
        })
    }
    catch (error){
        console.log(error)
        return res.status(500).send({
            success:false,
            message:'Cannot GET all users',
            error
        })
    }
};


//login
exports.loginController = async(req,res) => {
    try{
        const{email,password} = req.body
        //validation
        if(!email || !password){
            return res.status(401).send({
                success:false,
                message: 'You got the creds right?'
            })
        }
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(200).send({
                success: false,
                message: 'Hmph, you are not in our system. Strange'
            })
        }
        //password
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).send({
                success:false,
                message: 'Invalid ID/Pass'
            })
        }
        return res.status(200).send({
            success:true,
            message: 'Heyy.Welcome back!!',
            user
        })

    }
    catch(error){
        console.log(error)
        return res.status(500).send({
            success: false,
            message:'Error in Login callback',
            error
        })
    }
};

//(4)8:42