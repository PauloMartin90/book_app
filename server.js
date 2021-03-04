'use strict'

// ============== Packages ==============================
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');
const methodOverride = require('method-override');

// ============== App ===================================
const app = express();
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
const PORT = process.env.PORT || 3111;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));



// ============== Routes ================================


app.get('/', getHomepage);
app.get('/books/:id', getSingleBook)
app.post('/searches', showSearches); 
app.get('/searches/new', getSearchPages); 
app.post('/books', addBook)
app.put('/books/:id', putSingleBook);
app.delete('/books/:id', deleteSingleBook);



// Homepage
  function getHomepage (req, res) {
    const sqlString = 'SELECT * FROM book;';
    client.query(sqlString)
    .then(result => {
      res.render('pages/index.ejs', {books: result.rows})
    }).catch(errorThatComesBack => {
        res.render('pages/error.ejs');
        console.log(errorThatComesBack);
    });
  }

  function getSingleBook (req, res) {
    const sqlString = 'SELECT * FROM book WHERE id=$1;';
    const sqlArr = [req.params.id];

    client.query(sqlString, sqlArr)
    .then( result => {
      const ejsObject = { books: result.rows[0] };
      res.render('pages/books/detail.ejs', ejsObject);
    })
    .catch(errorThatComesBack => {
      res.render('pages/error.ejs');
      console.log(errorThatComesBack);
    });
  };

  // Save Book Route
  function addBook (req, res) {
    const sqlString = 'INSERT INTO book (img, bookTitle, authors, book_description, isbn) VALUES ($1, $2, $3, $4, $5) RETURNING id;';
    const sqlArray = [req.body.img, req.body.bookTitle, req.body.authors, req.body.book_description, req.body.isbn];
    client.query(sqlString, sqlArray)
    .then(result => {
      const ejsObject = { books: req.body };
      ejsObject.books.id = result.rows[0].id;
      res.render('pages/books/detail.ejs', ejsObject);
    })
    .catch(errorThatComesBack => {
      res.render('pages/error.ejs');
      console.log(errorThatComesBack);
    });
  };

// ---------------------------Search----------------------------------
  function getSearchPages (req, res) {
    res.render('pages/searches/new.ejs');
  };

  function showSearches (req, res) {
      const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search}:${req.body.name}`;
      superagent.get(url)
        .then(results => {
          const books = results.body.items.map(book => new Book(book));
          res.render('pages/searches/show.ejs', {books: books})
        })
        .catch(errorThatComesBack => {
          res.render('pages/error.ejs');
          console.log(errorThatComesBack);
        });
  }
  // -----------------------------------------------------------------
  
  
  // Delete Book Route
  function deleteSingleBook (req, res){
    const sqlString = 'DELETE FROM book WHERE id=$1;';
    const sqlArr = [req.params.id];
    client.query(sqlString, sqlArr).then(result => {
    console.log("🚀 ~ file: server.js ~ line 98 ~ client.query ~ result", result)
      
      res.redirect('/');
    })
    .catch(errorThatComesBack => {
      res.render('pages/error.ejs');
      console.log(errorThatComesBack);
    });
  }

  // Update Book Route
  function putSingleBook(req, res){
    const sqlString = 'UPDATE book SET img=$1, bookTitle=$2, authors=$3, book_description=$4, isbn=$5 WHERE id=$6;';
    const sqlArr = [req.body.img, req.body.bookTitle, req.body.authors, req.body.book_description, req.body.isbn, req.params.id];
    client.query(sqlString, sqlArr).then(result => {
      res.redirect(`/books/${req.params.id}`);
    })
    .catch(errorThatComesBack => {
      res.render('pages/error.ejs');
      console.log(errorThatComesBack);
  
    });
  }


  // Book Constructor
  function Book (object) {
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

