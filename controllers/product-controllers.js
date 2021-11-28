const Product = require('../models/product');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/products/add:
 *   post:
 *     summary: Create account
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               detail: 
 *                  type: string
 *               image:
 *                 type: string
 *               brand:
 *                 type: string
 *               price:
 *                 type: string
 *               sizes:
 *                 type: string
 *               inventory: 
 *                  type: number
 *             example:   # Sample object
 *               name: Everly  
 *               description: Vo
 *               detail: abc
 *               image: https//abc.com
 *               sizes: [35, 67, 90]
 *               brand: Nike
 *               price: 500
 *               inventory: 100
 *     responses:
 *          '201':
 *              description: OK
*/
const addProduct = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(JSON.stringify(errors), 422)
        );
    }

    let createdProduct;
    try {
        createdProduct = new Product({ ...req.body });
        await createdProduct.save();
    } catch (err) {
        err && console.error(err);
        const error = new HttpError(
            'Add product failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ createdProduct });
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product information
 *     description: Only admin token or auth product token can access.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: id
 *           required: true
 *           description: product ID
 *           default: 6162c6420e172b1985d95e51
 *     responses:
 *          '200':
 *              description: OK
*/
const getProduct = async (req, res, next) => {
    let existingProduct;
    try {
        existingProduct = await Product.findOne({ _id: req.params.id });
        if (!existingProduct) return next(new HttpError(
            'Product does not exist',
            400
        ))
    } catch (err) {
        const error = new HttpError(
            'Fetching products failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ ...existingProduct._doc });
};

/**
 * @swagger
 * /api/products/{uid}:
 *   put:
 *     summary: Update product information
 *     description: Only admin token can access. Only properties are declared in request body will be overwritten. the others are kept the same.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: uid
 *           required: true
 *           description: product ID
 *     security: 
 *         - bearerAuth: []
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                      <property>:
 *                      example:   # Sample object
 *                          name: Jordant 2500  
 *                          sizes: [36, 37, 38]
 *     responses:
 *          '200':
 *              description: OK
*/
const updateProduct = async (req, res, next) => {
    let existingProduct;
    let updatedProduct;
    try {
        existingProduct = await Product.findOne({ _id: req.params.uid });
    }
    catch (err) {
        const error = new HttpError(
            'Failed to update product information',
            500
        );
        return next(error);
    }

    if (!existingProduct) {
        return next(new HttpError(
            'No product exist with this id ' + req.params.uid,
            404
        ));
    }

    try {
        if (req.body.name) existingProduct.name = req.body.name;
        if (req.body.description) existingProduct.description = req.body.description;
        if (req.body.detail) existingProduct.detail = req.body.detail;
        if (req.body.image) existingProduct.image = req.body.image;
        if (req.body.price) existingProduct.price = req.body.price;
        if (req.body.sizes) existingProduct.sizes = req.body.sizes;
        if (req.body.inventory) existingProduct.inventory = req.body.inventory;

        updatedProduct = await existingProduct.save();
    } catch (err) {
        const error = new HttpError(
            'Failed to update product information',
            500
        );
        return next(error);
    }

    res.json(updatedProduct);
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products by page and role
 *     description: Only admin token can access.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: query
 *           name: page
 *           type: integer
 *           required: true
 *           default: 0
 *           description: The page number
 *         - in: query
 *           name: limit
 *           default: 0
 *           type: integer
 *           required: true
 *           description: Maximum item per page. if limit=0 total item will be returned
 *     security: 
 *         - bearerAuth: [] 
 *     responses:
 *          '200':
 *              description: OK
*/
const getProducts = async (req, res, next) => {
    let products;
    let result;
    let totalProduct;
    try {
        const page = parseInt(req.query.page);
        const num_limit = parseInt(req.query.limit);

        if (page < 0 || num_limit < 0) throw '';
        const skip_item_num = (page - 1) * num_limit;

        products = await Product.find({}).skip(skip_item_num).limit(num_limit);
        totalProduct = await Product.find({}).count();

        result = {
            products: products.map(product => product.toObject({ getters: true })),
            total_page: Math.ceil(totalProduct / num_limit),
            current_page: page,
            total_product: totalProduct
        }
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Fetching products failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json(result);
};

/**
 * @swagger
 * /api/products/delete:
 *   delete:
 *     summary: Delete account
 *     description: Only admin token can access.
 *     produces:
 *         - application/json
 *     security: 
 *         - bearerAuth: []
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                      products:
 *                          type: Array
 *                      example:   # Sample object
 *                          products: ['1234', '6384'] 
*/
const deteleProducts = async (req, res, next) => {
    let deteleProductsArr = req.body.products;
    let result;
    try {
        result = await Product.deleteMany({ _id: { $in: deteleProductsArr } })
    }
    catch (err) {
        console.log(err);
        const error = new HttpError(
            'delete product failed',
            500
        );
        return next(error);
    }
    res.json(result);
};


module.exports = {
    addProduct,
    updateProduct,
    deteleProducts,
    getProducts,
    getProduct
}