const User = require('../models/user');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: Get user information
 *     description: Only admin token or auth user token can access.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: uid
 *           required: true
 *           description: user ID
 *           default: 6162c6420e172b1985d95e51
 *     security: 
 *         - bearerAuth: []
*/
const getUser = async (req, res, next) => {
    let existingUser;
    try {
        if (req.userData.role !== 'AD' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid }, '-password').populate('courses', '-source');
        if (!existingUser) next(new HttpError(
            'User does not exist',
            400
        ))
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({...existingUser._doc});
};

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Create account
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               password: 
 *                  type: string
 *                  format: password
 *               email:
 *                 type: string
 *                 format: email
 *             example:   # Sample object
 *               firstname: Everly  
 *               lastname: Vo
 *               password: abc
 *               role: USER
 *               email: email@gmail.com
 *     responses:
 *          '200':
 *              description: OK
*/
const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(JSON.stringify(errors), 422)
        );
    }

    let existingUser
    try {
        existingUser = await User.findOne({ email: req.body.email }, '-password')
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            400
        );
        return next(error);
    }

    let createdUser;
    try {
        const hashedPass = await bcrypt.hash(req.body.password, 12);
        createdUser = new User({ ...req.body, password: hashedPass });
        await createdUser.save();
    } catch (err) {
        err && console.error(err);
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               password: 
 *                  type: string
 *                  format: password
 *               email:
 *                 type: string
 *                 format: email
 *             example:   # Sample object
 *               email: admin@gmail.com
 *               password: admin@123
 *     responses:
 *          '200':
 *              description: OK
*/
const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later - 1',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    let isValidPass = false;
    try {
        isValidPass = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        err && console.log(err)
        const error = new HttpError(
            'Logging in failed, please try again later. - 2',
            500
        );
        return next(error);
    }

    if (isValidPass !== true) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    let token = "";
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email, role: existingUser.role }, 'xanhduong', { expiresIn: '8h' })
    }
    catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later. - 3',
            500
        );
        return next(error);
    }

    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token });
};

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     summary: Update user information
 *     description: Only admin token or auth user token can access.  Update only firstname, lastname, phone, role. Only properties are declared in request body will be overwritten. the others are kept the same.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: uid
 *           required: true
 *           description: user ID
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
 *                          firstname: Everly  
 *                          lastname: Vo
 *     responses:
 *          '200':
 *              description: OK
*/
const updateUser = async (req, res, next) => {
    let existingUser;
    let updatedUser;
    try {
        if (req.userData.role !== 'AD' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid }, '-password');
    }
    catch (err) {
        const error = new HttpError(
            'Failed to update user information',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        return next(new HttpError(
            'No user exist with this id ' + req.params.uid,
            404
        ));
    }

    try {
        if (req.body.firstname) existingUser.firstname = req.body.firstname;
        if (req.body.lastname) existingUser.lastname = req.body.lastname;
        if (req.body.phone) existingUser.phone = req.body.phone;
        if (req.body.role) existingUser.role = req.body.role;

        updatedUser = await existingUser.save();
    } catch (err) {
        const error = new HttpError(
            'Failed to update user information',
            500
        );
        return next(error);
    }

    res.json(updatedUser);
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users by page and role
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
 *         - in: query
 *           name: role
 *           default: "USER"
 *           type: string
 *           description: roles of user include USER, AD
 *           enum: [ USER, AD]
 *     security: 
 *         - bearerAuth: [] 
 *     responses:
 *          '200':
 *              description: OK
*/
const getUsers = async (req, res, next) => {
    let users;
    let result;
    let totalUser;
    try {
        const page = parseInt(req.query.page);
        const num_limit = parseInt(req.query.limit);
        const role = req.query.role && req.query.role.toUpperCase() ;

        if (page < 0 || num_limit < 0) throw '';
        const skip_item_num = (page - 1) * num_limit;

        if (role) {
            users = await User.find({ role }, '-password').skip(skip_item_num).limit(num_limit);
            totalUser = await User.find({ role }).count();
        }
        else {
            users = await User.find({}, '-password').skip(skip_item_num).limit(num_limit);
            totalUser = await User.find({}).count();
        }

        result = {
            users: users.map(user => user.toObject({ getters: true })),
            total_page: Math.ceil(totalUser / num_limit),
            current_page: page,
            role: role,
            total_user: totalUser
        }
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json(result);
};

/**
 * @swagger
 * /api/users/delete:
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
 *                      users:
 *                          type: Array
 *                      example:   # Sample object
 *                          users: ['1234', '6384'] 
*/
const deteleUsers = async (req, res, next) => {
    let deleteUsersArr = req.body.users;
    let result;
    try {
        result = await User.deleteMany({ _id: { $in: deleteUsersArr } })
    }
    catch (err) {
        console.log(err);
        const error = new HttpError(
            'delete user failed',
            500
        );
        return next(error);
    }
    res.json(result);
};


module.exports = {
    signup,
    getUsers,
    login,
    updateUser,
    getUser,
    deteleUsers,
}