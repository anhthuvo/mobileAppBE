const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const userController = require('../controllers/user-controllers');
const { signup, getUsers, login, updateUser, getUser, deteleUsers } = userController;

const { checkAuthUser, checkAuthAdmin } = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');



router.post('/signup',
    [
        check('firstname')
            .not()
            .isEmpty(),
        check('lastname')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    signup);

router.post('/login', login);

router.put('/:uid', checkAuthUser, updateUser);

router.delete('/delete', checkAuthAdmin, deteleUsers);

router.get('/', checkAuthAdmin, getUsers);

router.get('/:uid', checkAuthUser, getUser);

module.exports = router;