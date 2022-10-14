const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name : { type: String, required: true },
});

//virtual product url
CategorySchema.virtual("url").get(function(){
    return `/catalog/category/${this._id}`;
})

// Export model
module.exports = mongoose.model("Category", CategorySchema);