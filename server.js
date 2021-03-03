'use strict'

// ============== Packages ==============================
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');


// ============== App ===================================
const app = express();
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// ============== Routes ================================


// // const allTasks = [
// //   { name: 'walk Ginger', dueDate: 'today' },
// //   {name: 'clean the roof', dueDate: 'tomorrow'},
// //   {name: 'do homework', dueDate: 'today'},
// //   {name: 'paint something', dueDate: 'wednesday'},
// // ];

// app.get('/tasks', getAllTasks); //finished 1st // lab 1st

// // A dynamic variable in the route is called a path variable
// // a path variable is defined by putting a `:` in front of part of the route
// // the text after the `:` is the variable name

// app.get('/task/:task_id_potato', getSingleTask); // we will do this third // lab 2nd
// app.post('/task', addTask); // finished 2nd // lab 3rd

// app.put('/task/1', updateSingleTask);
// app.delete('/task/1', deleteSingleTask);

// function getAllTasks(req, res){
//   // res.send('getAllTasks');
//   // Purpose: take all the tasks from the global variable, render them to the page
//   // const ejsObject = { allTasks: allTasks };

//   const sqlString = 'SELECT * FROM task;';
//   client.query(sqlString) // takes in a sqlQueryString, and the template array
//     .then(result => {
//       const ejsObject = { allTasks: result.rows };
//       res.render('pages/show-tasks.ejs', ejsObject);
//     });

// }

// // http://localhost:3000/task/1 :: means go to task 1's detail view
// // http://localhost:3000/task/5 :: means go to task 5's detail view
// // app.get('/task/:task_id_potato',

// function getSingleTask(req, res) {
//   // res.send('getSingleTask');
//   // :task_id_potato can be found at `req.params.task_id_potato`

//   console.log('params', req.params);
//   const taskId = req.params.task_id_potato;

//   const sqlString = 'SELECT * FROM task WHERE id=$1';
//   const sqlArray = [taskId];
//   client.query(sqlString, sqlArray)
//     .then(result => {
//       // [ { id: 1, name: 'pet ginger', due_date: 'now' } ][0]
//       const task = result.rows[0];
//       const ejsObject = { task };
//       res.render('pages/single-task.ejs', ejsObject);

//     });

// }

// function addTask(req, res) {
//   // console.log(req.body);
//   // res.send('addTask');
//   // Purpose: add a task to the list of items, when it is successful,
//   //  OK: show them all tasks with the update
//   //  like lab: show them the detail view of that specific task (/task/1)

//   // allTasks.push(req.body);

//   const sqlString = 'INSERT INTO task (name, due_date) VALUES ($1, $2) RETURNING id;';
//   const sqlArray = [req.body.name, req.body.due_date];
//   client.query(sqlString, sqlArray)
//     .then(result => {
//       // THIS LINE IS THE FIRST TIME MY NEW TASK HAS AN ID
//       // potentially: look in the result of the insert
//       // console.log(result.rows);
//       const newThingId = result.rows[0].id;
//       res.redirect(`/task/${newThingId}`);

//     });
// }

// function updateSingleTask(req, res) {
//   res.send('updateSingleTask');
//   // purpose: update a tasks
//   //  like lab: show them the detail view of that specific task (/task/1)
// }

// function deleteSingleTask(req, res) {
//   res.send('deleteSingleTask');
//   // purpose: delete a task, send them to the all tasks page
// }
































app.set('view engine', 'ejs');

app.get('/',(req , res)=>{
    res.render('./pages/index.ejs');
})

  
  app.get('/searches/new', (req, res) => {
    res.render('./pages/searches/new.ejs');
  });

app.post('/searches', (req, res) => {

    let target = req.body.selectionType
    const url = `https://www.googleapis.com/books/v1/volumes?q=in${target}:${req.body.query}`;
    superagent.get(url)
      .then(data => {
        const newBookList = bookList(data.body.items);
        console.log(url);
        const ejsObject = { books:newBookList }
        res.render('./pages/searches/show.ejs', ejsObject);
      })
      .catch(error =>
        console.log('something went wrong', error));
  });
  
  function bookList(bookInfo) {
    return bookInfo.map(book => {
      return new Book(
        book.volumeInfo.title,
        book.volumeInfo.authors,
        book.volumeInfo.description,
        book.volumeInfo.imageLinks)
    }
    );
  
  }
  function Book (title, authors, description, image) {
    let dummyImage = "https://i.imgur.com/J5LVHEL.jpg";
    let hasImage = image === undefined;
    let newImage = !hasImage ? image.thumbnail : dummyImage;
    this.title = title,
    this.image = newImage;
    this.authors = authors,
    this.description = description  
  }










// ============== Initialization ========================
// client.connect().then(() => {
//     app.listen(PORT, function(){console.log(`up on http://localhost:${PORT}`);});
  
//   });

  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));