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
const PORT = process.env.PORT || 3111;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// ============== Routes ================================


app.get('/', getHomepage); //finished 1st // lab 1st
app.get('/searches/new', getSearchPages); //finished 1st // lab 1st
app.post('/searches', showSearches); // finished 2nd // lab 3rd

app.get('/books/:id', getSingleBook)
app.get('/books', addBook)

// app.put('/task/1', updateSingleTask);
// app.delete('/task/1', deleteSingleTask);

// Callbacks
  function getHomepage (req, res) {
    const sqlString = 'SELECT * FROM book;';
    client.query(sqlString).then(result => {
      console.log(result.rows)
      res.render('./pages/index.ejs', {books: result.rows})
    });
  }

  function getSingleBook (req, res) {
    console.log(req.params);
    const sqlString = 'SELECT * FROM book WHERE id = $1'
    const sqlArr = [req.params.id];
    client.query(sqlString, sqlArr).then(result => {
      const ejsObject = {books: result.rows[0]};
      res.render('pages/books/detail.ejs', ejsObject);
    });
  };


  function addBook (req, res) {
    const sqlString = 'INSERT INTO book (img, bookTitle, authors, book_description, isbn) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const sqlArray = [req.body.img, req.body.bookTitle, req.body.authors, req.body.book_description, req.body.isbn];
    client.query(sqlString, sqlArray).then(result => {
      const ejsObject = {books: req.body}
      res.render('pages/books/detail.ejs', ejsObject);
    });
  };




    // function getSingleBook (req, res) {
    //   res.render("pages/books/details.ejs")
    // }


    // function addBook (req, res) {
    //   res.render("pages/books:id")
    // }









      function updateSingleTask(req, res) {
        // purpose: update a tasks
        //  like lab: show them the detail view of that specific task (/task/1)
        res.send('updateSingleTask')

      }
      
      function deleteSingleTask(req, res) {
        // purpose: delete a task, send them to the all tasks page
        res.send('deleteSingleTask')

      }


  
  function getSearchPages (req, res) {
    res.render('./pages/searches/new.ejs');
  };

function showSearches (req, res) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search}:${req.body.name}`;
    superagent.get(url)
      .then(results => {
        const books = results.body.items.map(book => new Book(book));
        console.log(books)
        console.log(url);
        res.render('pages/searches/show.ejs', {books: books})
      }).catch(error => {
        res.render('pages/error.ejs');
        console.log('something went wrong', error);
      })
}
  

  function Book (object) {
  console.log("🚀 ~ file: server.js ~ line 117 ~ Book ~ object", object)
    
    this.img = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail: "https://i.imgur.com/J5LVHEL.jpg";
    this.bookTitle = object.volumeInfo.title;
    this.authors = object.volumeInfo.authors ? object.volumeInfo.authors[0] : 'unknown author'
    this.book_description = object.volumeInfo.description ? object.volumeInfo.description : 'Sorry, no description available.';
    this.isbn = object.volumeInfo.industryIdentifiers ? object.volumeInfo.industryIdentifiers[0].identifier : 'No ISBN Available' ;
  }




// ============== Initialization ========================
client.connect().then(() => {
    app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
  
});

