const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const User = require('../models/user');
const authController = require('../controller/auth');
const isauth = require('../Middelware/is-auth');   

router.put('/signup',[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email!')
        .custom((value,{req}) => {
            return User.findOne({email:value})
                .then(userDoc=>{
                    if(userDoc){
                        return Promise.reject('E-mail Already Exist!');
                    }
                })
        })
        .normalizeEmail(), 
    body('password').trim().isLength({min:5}).withMessage('Please enter a password!'),  
    body('name').trim().not().isEmpty().withMessage('Please enter a valid name!')  
],authController.signup);

router.post('/login',authController.login); 

router.get('/status',isauth,authController.getUserStatus);

router.put('/status',isauth,authController.updateUserStatus);  
 
module.exports = router;

//JWT reference
//https://jwt.io/introduction
//https://chat.openai.com/chat/043c05b6-1979-409b-b93b-404f297a5746