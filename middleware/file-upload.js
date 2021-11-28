const multer = require('multer');
const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const { Readable } = require('stream');

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

const fileUpload = async (req, res, next) => {
  if (bucket) {
    const imgId = uuid();
    try {
      const imageUploadStream = bucket.openUploadStream(imgId);
      const imageReadableStream = new Readable();
      imageReadableStream.push(null);
      if (imageReadableStream[0]) imageReadableStream.pipe(imageUploadStream);
      console.log('done')
    }
    catch (err) { console.log(err) }
  }
}

const fileDownload = async (req, res, next) => {
  mongoose
    .connect('mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/ShoeApp?retryWrites=true&w=majority', function (err, db) {
      if (err) return console.dir(err);

      const bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'images'
      })

      const imgId = uuid();
      try {
        const imageUploadStream = bucket.openUploadStream(imgId);
        const imageReadableStream = new Readable();
        imageReadableStream.push(null);
        imageReadableStream.pipe(imageUploadStream);
        console.log('done')
      }
      catch (err) { console.log(err) }
    })
}

module.exports = {
  fileUpload,
  fileDownload
}
