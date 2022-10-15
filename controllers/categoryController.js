const Category = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = (req, res,next) => {
  Category.find({}, "name")
  .sort({ name : 1})
  .exec(function(err, list_category){
    if(err){
        return next(err);
    }
    //sucesss and render
    res.render('category_list',{
        title : "Category List",
        category_list : list_category
    })
  })
};

// Display detail page for a specific Category.
exports.category_detail = (req, res,next) => {
    async.parallel(
        {
            category(callback){
                Category.findById(req.params.id)
                .exec(callback);
            },
        },
        (err,results)=>{
            if(err){
                return next(err);
            }
            // if result not error but null
            if(results.category == null){
                const err = new Error("Category not found");
                err.status = 404;
                return next(err);
            }
        //sucess and render
        res.render('category_detail',{
            title : 'Category Information',
            category_name : results.category.name
        })
        }
    )
};

// Display Category create form on GET.
exports.category_create_get = (req, res) => {
  res.render('category_form',{ tittle : 'Create New Category'})
};


// Handle Category create on POST.
exports.category_create_post = [
    // Validate and sanitize the name field.
    body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      const category = new Category({ name: req.body.name });
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render("category_form", {
          title: "Create Category",
          category,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
        // Check if Category with same name already exists.
        Category.findOne({ name: req.body.name }).exec((err, found_category) => {
          if (err) {
            return next(err);
          }
  
          if (found_category) {
            // Category exists, redirect to its detail page.
            res.redirect(found_category.url);
          } else {
            category.save((err) => {
              if (err) {
                return next(err);
              }
              // Category saved. Redirect to category detail page.
              res.redirect(category.url);
            });
          }
        });
      }
    },
  ];
  
// Display Category delete form on GET.
exports.category_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Category delete GET");
};

// Handle Category delete on POST.
exports.category_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Category delete POST");
};

// Display Category update form on GET.
exports.category_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Category update GET");
};

// Handle Category update on POST.
exports.category_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Category update POST");
};
