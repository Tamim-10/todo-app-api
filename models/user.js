// Importing Mongoose library   
const mongoose = require('mongoose');
// Destructuring 'Schema' from mongoose
const { Schema } = mongoose;

// Defining the User Schema using the imported Schema class
const userSchema = new Schema(
  {
    // Defining the 'email' field with type String and required constraint
    email: {
      type: String,
      required: true
    },
    // Defining the 'password' field with type String and required constraint
    password: {
      type: String,
      required: true
    },
    // Defining the 'name' field with type String and required constraint
    name: {
      type: String,
      required: true
    },
    // Defining the 'todos' field as an array of ObjectIds referencing the 'todos' model
    todos: [{
        type : Schema.Types.ObjectId, // Post Id as foreign key
        ref :'todos' // Reference to the 'todos' model
    }]
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields    
);

// Exporting the Mongoose model based on the User schema
module.exports = mongoose.model('User', userSchema); 
