const fs = require('fs'); 
const path = require('path');
const {validationResult } = require('express-validator');

const Todo = require('../models/todos');
const User = require('../models/user'); 

exports.getTodos = async (req, res, next) => {
   const currentPage = req.query.page || 1;
   const perPage = 3;
   try{
      let totalItems = await Todo.find({creator: req.userId}).countDocuments();
      const todos = await Todo.find({ creator: req.userId })
      .populate('creator')
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
      .skip((currentPage - 1) * perPage)
      .limit(perPage); 
      res.status(200)
         .json({
               message: 'Fetched todos successfully.',
               todos: todos,
               totalItems: totalItems
            });
   }catch(err){
      if (!err.statusCode) {
      err.statusCode = 500;
      }
      next(err);
   }  
 };

exports.createTodos = (req,res,next) => { 
   const text    = req.body.text;
    console.log(`Added Todo:${text}`);
   //Server Side Validation
   const errors = validationResult(req);
   console.log(errors);
   if(!errors.isEmpty()){
      const error = new Error('Validation Failed,invalid input!');
      error.statusCode = 422;
      throw error;
   }
   //Server Side Validation
   // if(!req.file){
   //    const error = new Error('No Image provided.');
   //    error.statusCode = 422;
   //    throw error; // leads to catch block
   // }
   
   const todo = new Todo({
      text: text, 
      creator:req.userId,
   });    
   todo.save()
      .then(result =>{
         console.log(result);
         return User.findById(req.userId);
      })
      .then(user=>{
         creator=user;
         user.todos.push(todo);
         return user.save()
      })
      .then(result=>{
         console.log(result);
         res.status(201).json({
            message:'Todo Created Successfully!',
            todos:todo,  
            creator:{_id: creator._id,name: creator.name}
         });
      })
      .catch(err=>{
         if(!err.statusCode){
            err.statusCode = 500;
         }
         next(err);
      }); 
};

exports.getTodo = (req,res,next) => {
   const todoId = req.params.todoId;
   Todo.findById(todoId) 
      .then(todo => {  
         console.log(todo);
         if(!todo){
           const error = new Error('Todo not found');
           error.statusCode = 400;
           throw error; // leads to catch block
         }
         return res.status(200).json({
            message: 'Single Todo Fetched',
            todo:todo
         })
      })
      .catch(err=>{
         console.log(err);
         if(!err.statusCode){
            err.statusCode = 500;
         }
         next(err);
      }); 
};

exports.updateTodo = (req, res, next) => {
   const todoId = req.params.todoId;
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     const error = new Error('Validation failed, entered data is incorrect.');
     error.statusCode = 422;
     throw error;
   }
   const text = req.body.text;

   Todo.findById(todoId)
     .then(todo => {
         if (!todo) {
            const error = new Error('Could not find todo.');
            error.statusCode = 404;
            throw error;
         }
         if (todo.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
         }
         // if (imageUrl !== todo.imageUrl) {
         //    clearImage(todo.imageUrl);
         // }  
         todo.text = text;
         return todo.save();
     })
     .then(result => {
       res.status(200).json({ message: 'Todo updated!', todo: result });
     })
     .catch(err => {
       if (!err.statusCode) {
         err.statusCode = 500;
       }
       next(err);
     });
};

exports.deleteTodo = (req, res, next) => {
   const todoId = req.params.todoId;
   Todo.findById(todoId)
     .then(todo => {
         if (!todo) {
            const error = new Error('Could not find todo.');
            error.statusCode = 404;
            throw error;
         }
         if (todo.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
         }
         // Check logged in user
         // clearImage(todo.imageUrl);
         return Todo.findByIdAndRemove(todoId);
     })
     .then(result => {  
         return User.findById(req.userId);
      })
      .then(user => {
         user.todos.pull(todoId);
         return user.save();
      })
      .then(result => {
         res.status(200).json({ message: 'Deleted todo.' });
      })
     .catch(err => {
         if (!err.statusCode) {
         err.statusCode = 500;
         }
         next(err);
     });
};

exports.getStatus = (req,res,next) => {
   User.findById(req.userId)
      .then(user=>{
         res.status(200).json({message:'Get Status',status:user.status});
      })
      .catch(err => {
         if (!err.statusCode) {
         err.statusCode = 500;
         }
         next(err);
     });
};

exports.updateStatus = (req,res,next) => {
   const status = req.body.status;
   User.findById(req.userId)
      .then(user=>{
         user.status = status;
         return user.save();
      })
      .then(user=>{
         res.status(200).json({message:'Status Updated',status:user.status});
      })
      .catch(err => {
         if (!err.statusCode) {
         err.statusCode = 500;
         }
         next(err);
     });
};  
      
// const clearImage = filePath => {
//    filePath = path.join(__dirname, '..', filePath);
//    fs.unlink(filePath, err => console.log(err));
// };   