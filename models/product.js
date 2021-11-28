const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Name is required',
        trim: true,
    },
    description: {
        type: String,
        required: 'Description is required',
        trim: true,
    },
    detail: {
        type: String,
        trim: true,
    },
    image: {
        type: Array,
        required: 'Image is required as least one',
        trim: true,
    },
    brand: {
        type: String,
        required: 'Brand is required',
        trim: true,
    },
    price: {
        type: String,
        required: 'Price is required',
        trim: true,
    },
    sizes: {
        type: [{ type: Number }],
        required: 'Price is required',
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    inventory: {
        type: Number,
        require: true
    }
})

module.exports = mongoose.model('Product', ProductSchema);