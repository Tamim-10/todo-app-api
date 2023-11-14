// Importing necessary modules and packages
const express = require('express');    

// Destructuring 'body' from express-validator  
const { body } = require('express-validator');    
const router = express.Router();

// Importing the 'todos' controller and the 'is-auth' middleware
const todosController = require('../controller/todos');  
const isAuth = require('../Middelware/is-auth');
   
// isAuth helps to grant access to requests for authenticated users.

// GET /todos
router.get('/', isAuth, todosController.getTodos);

// TODO /todos
router.post('/', [
    // body('title').trim().isLength({ min: 5 }),
    // body('content').trim().isLength({ min: 5 })
], isAuth, todosController.createTodos);

// GET /todos/:todosId
router.get('/:todoId', isAuth, todosController.getTodo); 
  
// PUT /todos/:todosId
router.put(
    '/:todoId',
    [
        body('text')
            .trim()
    ],
    isAuth, todosController.updateTodo
);

// DELETE /todos/:todosId
router.delete('/:todoId', isAuth, todosController.deleteTodo);

// Exporting the router
module.exports = router;  
