require('dotenv').config();  
// Importing necessary modules and packages
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Importing custom route handlers
const todoRoutes = require('./routes/todos');
const authRoutes = require('./routes/auth');

// Creating an instance of the Express application
const app = express();

// Configuring Multer to adjust filename & filepath for file uploads
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images'); // Save uploaded files in the 'images' directory
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, uuidv4() + file.originalname); // Set a unique filename using UUID and original filename
    }
});

// Filtering files based on their mimetype
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/svg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Configuring middleware for parsing JSON requests
app.use(bodyParser.json());

// Registering Multer middleware with specified storage and file filter
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

// Serving static files (images) from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Enabling CORS (Cross-Origin Resource Sharing) by setting headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Routing configuration
app.use('/todo', todoRoutes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

// Connecting to MongoDB database and starting the server
mongoose
    .connect(process.env.MONGODB_URI)
    .then(result => {
        app.listen(process.env.PORT, () => {
            console.log(`Server Started at port ${process.env.PORT}`);
        });
    })
    .catch(err => console.log(err));
