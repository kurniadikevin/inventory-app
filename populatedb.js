#! /usr/bin/env node

console.log('This script populates some test product and category to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Product = require('./models/product')


var mongoose = require('mongoose');
//const { product_detail } = require('./controllers/productController');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = []
var categories = []
//var books = []
//var bookinstances = []

/* function authorCreate(first_name, family_name, d_birth, d_death, cb) {
  authordetail = {first_name:first_name , family_name: family_name }
  if (d_birth != false) authordetail.date_of_birth = d_birth
  if (d_death != false) authordetail.date_of_death = d_death
  
  var author = new Author(authordetail);
       
  author.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Author: ' + author);
    authors.push(author)
    cb(null, author)
  }  );
} */

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function productCreate(name,description,category,price,numberOfStock,cb) {
  product_detail = { 
    name : name,
    description : description,
    category : category,
    price : price,
    numberOfStock : numberOfStock
  }
  if (category != false) product_detail.category = category
    
  var product = new Product(product_detail);    
  product.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Product: ' + product);
    products.push(product)
    cb(null, product)
  }  );
}

/* 
function bookInstanceCreate(book, imprint, due_back, status, cb) {
  bookinstancedetail = { 
    book: book,
    imprint: imprint
  }    
  if (due_back != false) bookinstancedetail.due_back = due_back
  if (status != false) bookinstancedetail.status = status
    
  var bookinstance = new BookInstance(bookinstancedetail);    
  bookinstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING BookInstance: ' + bookinstance);
      cb(err, null)
      return
    }
    console.log('New BookInstance: ' + bookinstance);
    bookinstances.push(bookinstance)
    cb(null, book)
  }  );
}
 */

function createCategory(cb) {
    async.series([
        function(callback) {
          categoryCreate("Cassette", callback);
        },
        function(callback) {
            categoryCreate("CompactDisc", callback);
          },
          function(callback) {
            categoryCreate("Vinyl", callback);
          },
        ],
        // optional callback
        cb);
}


function createProduct(cb) {
    async.parallel([
        
        function(callback) {
          productCreate('Nightfly by Donald Fagen', 'Well used condition with broken cover', categories[2],20,1,callback)
        },
        function(callback) {
            productCreate('Aja by Steely Dan', 'Mint condition with good cover', categories[2],25,3,callback)
          },
        function(callback) {
            productCreate('Kind of Blue by Miles Davis', 'Mint condition with good cover', categories[1],15,5,callback)
          },
        function(callback) {
            productCreate('Love Supreme by John Coltrane', 'Mint condition with good cover', categories[2],35,2,callback)
          },
        function(callback) {
            productCreate('Compilation by Bill Evans', 'Good condition with good cover', categories[0],15,3,callback)
          },
        function(callback) {
            productCreate('Another Green World by Brian Eno', 'Good condition with good cover', categories[0],10,10,callback)
          }
        
        ],
        // optional callback
        cb);
}

/* 
function createBookInstances(cb) {
    async.parallel([
        function(callback) {
          bookInstanceCreate(books[0], 'London Gollancz, 2014.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[1], ' Gollancz, 2011.', false, 'Loaned', callback)
        },
        function(callback) {
          bookInstanceCreate(books[2], ' Gollancz, 2015.', false, false, callback)
        },
        function(callback) {
          bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
        },
        function(callback) {
          bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
        },
        function(callback) {
          bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
        },
        function(callback) {
          bookInstanceCreate(books[0], 'Imprint XXX2', false, false, callback)
        },
        function(callback) {
          bookInstanceCreate(books[1], 'Imprint XXX3', false, false, callback)
        }
        ],
        // Optional callback
        cb);
}

 */

async.series([
    createCategory,
    createProduct
   
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('product: '+products);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



