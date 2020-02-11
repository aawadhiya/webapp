const express = require("express");
const router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'tmp/',errorHandling: 'manual' })

const appcontroller = require("../controllers/appController");
const billcontroller = require("../controllers/billController");
const filecontroller = require("../controllers/fileController");

router.post('/user', appcontroller.register);
router.get('/user/self', appcontroller.login);
router.put('/user/self', appcontroller.update);
router.post('/bill', billcontroller.registerBill);
router.get('/bill/:id', billcontroller.getBillById);
router.put('/bill/:id', billcontroller.updateBill);
router.get('/bills/', billcontroller.getBills);
router.delete('/bill/:id', billcontroller.deleteBill);

router.post('/bill/:id/file', upload.single('fileUpload'), function (err, req, res, next) {
    console.error(err.stack)
    res.status(400).send({meesage:'Bad Request ,Formdata is not correct! use fileUpload as key'})
  }  ,filecontroller.addFile);
//router.post('/bill/:id/file', filecontroller.addFile);

  router.get('/bill/:billId/file/:fileId', filecontroller.getFile);
  router.delete('/bill/:billId/file/:fileId', filecontroller.deleteFile);

module.exports = router;
