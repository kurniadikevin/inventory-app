const Category = require("../models/category");
const Product = require("../models/product");
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
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all books.
exports.product_list = (req, res,next) => {
  Product.find({}, "name category")
  .sort({ name: 1 })
  .populate("category")
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
          .populate("category")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.product == null) {
        // No results.
        const err = new Error("Product not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("product_detail", {
        title : 'Product Detail',
        name : results.product.name,
        product: results.product,
        numberOfStock : results.product.numberOfStock,
        price : results.product.price,
        category : results.product.category.name
      });
    }
  );
};
// Display product create form on GET.
exports.product_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Product create GET");
};

// Handle product create on POST.
exports.product_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Product create POST");
};

// Display product delete form on GET.
exports.product_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Product delete GET");
};

// Handle product delete on POST.
exports.product_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Product delete POST");
};

// Display product update form on GET.
exports.product_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Product update GET");
};

// Handle product update on POST.
exports.product_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Product update POST");
};
