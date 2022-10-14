const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name : { type: String, required: true },
    description : { type : String, required: true},
    category : { type : Schema.Types.ObjectId, ref : "Category"},
    price : {type: Number, required : true },
    numberOfStock : {type: Number, required : true}
});

//virtual product url
ProductSchema.virtual("url").get(function(){
    return `/catalog/product/${this._id}`;
})

// Export model
module.exports = mongoose.model("Product", ProductSchema);