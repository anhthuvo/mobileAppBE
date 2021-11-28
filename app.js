const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const userRoutes = require('./routes/user-routes');
const productRoutes = require('./routes/product-routes');
const HttpError = require('./models/http-error');
const bodyParse = require('body-parser');
const { fileUpload } = require('./middleware/file-upload');
const app = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Elearning API',
      version: '1.0.0',
      contact: {
        name: 'thu.vohoanganh96@gamil.com',
        url: 'https://anhthuvo.github.io/Anh-Thu-Vo-Porfolio.github.io/',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/',
        description: 'Development'
      },
      {
        url: 'https://elearning-be.herokuapp.com',
        description: 'Production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ['./controllers/product-controllers.js', './controllers/user-controllers.js'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

app.use(cors());

app.use(bodyParse.json());

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});

app.use('/api/users', userRoutes);

app.use('/api/products', productRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || 'An unknown error occurred!',
    code: error.code,
    data: error.data
  });
});

mongoose
  .connect('mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/ShoeApp?retryWrites=true&w=majority', function(err, db) {
    if(err) return console.dir(err); 
    app.listen(process.env.PORT || 5000);
  })
