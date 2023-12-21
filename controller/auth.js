require('dotenv').config();
const jwtSecret=process.env.JWT_Secret;  
// Importing necessary modules and packages
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const jwt  = require('jsonwebtoken');

// Controller function for user signup
exports.signup = (req, res, next) => {
    // Server-side validation using express-validator
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error; // goes to catch block
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    // Hashing the password using bcrypt
    bcrypt.hash(password, 12)
        .then(hashedPw => {
            console.log(`Hashed Password: ${hashedPw}`);
            const user = new User({
                email: email,
                name: name,
                password: hashedPw // Storing Hashed Password to Database
            });
            return user.save();
        })
        .then(result => {
            return res.status(201).json({ message: 'User Created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                const error = new Error('Validation Failed!');
                error.statusCode = 401;
                error.data = errors.array();
                throw error; // goes to catch block
            }
            next(err);
        });
};

// Controller function for user login
exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(`Password: ${password}`);

    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error; // goes to catch block
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            console.log('Password Matched');
            if (!isEqual) {
                const error = new Error('Wrong Password!');
                error.statusCode = 401;
                throw error; // goes to catch block  
            }
            // Creating a JSON Web Token (JWT) for authentication
            const token = jwt.sign(
                {
                    email: loadedUser.email, // PAYLOAD
                    userId: loadedUser._id.toString() // PAYLOAD
                },
                jwtSecret, // Private key known only by the server
                { expiresIn: '1h' } // Token expires in 1 hour for security reasons
            );
            res.status(200).json({ token: token, userId: loadedUser._id.toString(),userName: loadedUser.name});
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                const error = new Error('Validation Failed!');
                error.statusCode = 500;
                throw error; // goes to next 
            }
            next(err);
        });
}; 

// Controller function for getting user status
exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            res.status(200).json({ message: 'Get Status', status: user.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// Controller function for updating user status
exports.updateUserStatus = (req, res, next) => {
    const status = req.body.status;
    User.findById(req.userId)
        .then(user => {
            user.status = status;
            return user.save();
        })
        .then(user => {
            res.status(200).json({ message: 'Status Updated', status: user.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
 