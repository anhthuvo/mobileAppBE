const multer = require('multer');
const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');
const { GridFsStorage } = require("multer-gridfs-storage");
const HttpError = require('../models/http-error');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

let bucket;
mongoose.connect('mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/ShoeApp?retryWrites=true&w=majority', function (err, db) {
  if (err) return console.dir(err);

  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'images'
  })
})

const imgName = uuid()
const storage = new GridFsStorage({
  url: 'mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/ShoeApp?retryWrites=true&w=majority',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = Object.keys(MIME_TYPE_MAP);

    if (match.indexOf(file.mimetype) === -1) {
      return next(new Error(
        'image format is not allowed',
        400
      ))
    }

    return {
      bucketName: 'images',
      filename: imgName
    };
  }
});

const upload = multer({ storage: storage })


const fileDownload = async (req, res, next) => {
  mongoose
    .connect('mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/ShoeApp?retryWrites=true&w=majority', function (err, db) {
      if (err) {
        console.dir(err);
        return next(new HttpError(
          'Fetching users failed, please try again later.',
          500
        ))
      }

      const imgName = req.params.name;
      try {
        const image = db.collection('images.files').findOne({ _id: imgName });
        if (!image) return next(new HttpError(
          'No image with this id exist',
          404
        ))

        const downloadStream = bucket.openDownloadStreamByName(imgName);
        downloadStream.on("data", function (data) {
          return res.status(200).write(data);
        });

        downloadStream.on("error", function (err) {
          console.log(err);
          return next(new HttpError(
            'Fail to get image',
            500
          ))
        });

        downloadStream.on("end", () => {
          return res.end();
        });
      }
      catch (err) {
        console.log(err)
        return next(new HttpError(
          'Fail to get image',
          500
        ))
      }
    })
}

module.exports = {
  upload,
  fileDownload
}
