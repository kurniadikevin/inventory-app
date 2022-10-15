const Category = require("../models/category");
const async = require("async");

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
  res.send("NOT IMPLEMENTED: Category create GET");
};

// Handle Category create on POST.
exports.category_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Category create POST");
};

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
