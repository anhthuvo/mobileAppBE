const express = require('express');
const { upload, fileDownload, storeImgId} = require('../middleware/file-upload');
const { storeImgName } = require('../controllers/product-controllers')
const router = express.Router();

router.get('/:name', fileDownload);

router.post('/:productId', upload.single('file'), storeImgName);


module.exports = router;
