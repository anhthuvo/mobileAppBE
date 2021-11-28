const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const productController = require('../controllers/product-controllers');
const { addProduct, updateProduct, deteleProducts, getProducts, getProduct } = productController;

const { checkAuthUser, checkAuthAdmin } = require('../middleware/check-auth');

router.post('/add',
    [
        check('name').not().isEmpty(),
        check('description').not().isEmpty(),
        check('detail').not().isEmpty(),
        check('image').not().isEmpty(),
        check('price').not().isEmpty(),
        check('sizes').not().isEmpty(),
        check('inventory').not().isEmpty(),
    ],
    checkAuthUser,
    addProduct);

router.put('/:uid', checkAuthUser, updateProduct);

router.delete('/delete', checkAuthAdmin, deteleProducts);

router.get('/', getProducts);

router.get('/:id', getProduct);

module.exports = router;