require('dotenv').config();
// Importing the JSON Web Token (JWT) library      
const jwt = require('jsonwebtoken');
const jwtSecret=process.env.JWT_Secret;
console.log(jwtSecret); 
// Middleware for validating the token on each subsequent request on the server side
module.exports = (req, res, next) => {
    // Extracting the 'Authorization' header from the request
    const authHeader = req.get('Authorization');

    // If 'Authorization' header is not present, the request is not authenticated
    if (!authHeader) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }

    // Extracting the token from the 'Authorization' header (assuming a format like 'Bearer <token>')
    const token = authHeader.split(' ')[1];

    let decodedToken;

    try {
        decodedToken = jwt.verify(token,jwtSecret);     
    } catch (err) {
        // If token verification fails, set a 500 status code and throw an error
        err.statusCode = 500;
        throw err;
    }

    // Logging the decoded token (contains information like userId)
    console.log(decodedToken);

    // If the token is not decoded successfully, the request is not authenticated
    if (!decodedToken) {
        const error = new Error('Not Authenticated');
        error.statusCode = 401;
        throw error;
    }

    // Adding the userId from the decoded token to the request object for further use in the route handling
    req.userId = decodedToken.userId;

    // Proceed to the next middleware or route handler
    next(); 
};  