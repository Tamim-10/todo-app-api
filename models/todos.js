// Importing Mongoose library      
const mongoose = require('mongoose');
// Destructuring 'Schema' from mongoose
const { Schema } = mongoose;

// Defining the Post Schema using the imported Schema class
const todosSchema = new Schema(
  {
    // Defining the 'text' field with type String and required constraint
    text: {
      type: String,
      required: true
    },
    // Defining the 'creator' field as an ObjectId referencing the 'User' model, with a required constraint
    creator: {
      type: Schema.Types.ObjectId,  
      ref: 'User', // Reference to the 'User' model
      required: true
    }  
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields  
);

// Exporting the Mongoose model based on the Todos schema
module.exports = mongoose.model('Todos', todosSchema);
