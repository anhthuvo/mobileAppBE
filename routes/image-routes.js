const express = require('express');
const { fileUpload, fileDownload } = require('../middleware/file-upload');
const router = express.Router();

router.get('/:id', fileDownload);

module.exports = router;
