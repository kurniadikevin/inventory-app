const Product = require("../models/product");
const Category = require("../models/category");

const { body, validationResult } = require("express-validator");


const async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      product_count(callback) {
        Product.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("catalog", {
        title: "Local Inventory Home",
        error: err,
        data: results,
      });
    }
  );
};


// Display list of all products.
exports.product_list = function (req, res, next) {
  Product.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec(function (err, list_product) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("product_list", { title: "Product List", product_list: list_product });
    });
};


// Display detail page for a specific product.
exports.product_detail = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        Product.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      product_instance(callback) {
        productInstance.find({ product: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.product == null) {
        // No results.
        const err = new Error("product not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("product_detail", {
        title: results.product.title,
        product: results.product,
        product_instances: results.product_instance,
      });
    }
  );
};


// Display product create form on GET.
exports.product_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our product.
  async.parallel(
    {
     
      category(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("product_form", {
        title: "Create product",
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};


// Handle product create on POST.
exports.product_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a product object with escaped and trimmed data.
    const product = new product({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors(callback) {
            Author.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (product.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("product_form", {
            title: "Create product",
            authors: results.authors,
            genres: results.genres,
            product,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save product.
    product.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new product record.
      res.redirect(product.url);
    });
  },
];

// Display Author delete form on GET.
exports.product_delete_get = (req, res, next) => {
  async.parallel(
    {
      product(callback) {
        product.findById(req.params.id).exec(callback);
      },
      products_productinstances: function (callback) {
        productInstance.find({ product: req.params.id }).exec(callback);
      },

    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.product == null) {
        // No results.
        res.redirect("/catalog/products");
      }
      console.log(results)
      // Successful, so render.
      res.render("product_delete", {
        title: "Delete product",
        product: results.product,
        products_productinstances: results.products_productinstances,
      });
    }
  );
};

// Handle product delete on POST
exports.product_delete_post = function (req, res, next) {
  async.parallel(
    {
      product: function (callback) {
        product.findById(req.params.productid).exec(callback);
      },
      products_productinstances: function (callback) {
        productInstance.find({ product: req.params.productid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.products_productinstances.length > 0) {
        // product has productinstances. Render in the same way as for GET route.
        res.render("product_delete", {
          title: "Delete product",
          product: results.product,
          products_productinstances: results.products_productinstances,
        });
        return;
      } else {
        // product has no productinstances. Delete object and redirect to the landing page.
        product.findByIdAndRemove(req.body.productid, function deleteproduct(err) {
          if (err) return next(err);
          // SUccess - go to product list
          res.redirect("/catalog/products");
        });
      }
    }
  );
};

// Display product update form on GET.
exports.product_update_get = (req, res, next) => {
  // Get product, authors and genres for form.
  async.parallel(
    {
      product(callback) {
        product.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      authors(callback) {
        Author.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.product == null) {
        // No results.
        const err = new Error("product not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const genre of results.genres) {
        for (const productGenre of results.product.genre) {
          if (genre._id.toString() === productGenre._id.toString()) {
            genre.checked = "true";
          }
        }
      }
      res.render("product_form", {
        title: "Update product",
        authors: results.authors,
        genres: results.genres,
        product: results.product,
      });
    }
  );
};


// Handle product update on POST.
exports.product_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a product object with escaped/trimmed data and old id.
    const product = new product({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors(callback) {
            Author.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (product.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("product_form", {
            title: "Update product",
            authors: results.authors,
            genres: results.genres,
            product,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    product.findByIdAndUpdate(req.params.id, product, {}, (err, theproduct) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to product detail page.
      res.redirect(theproduct.url);
    });
  },
];

