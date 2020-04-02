const express = require("express");
const router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'tmp/',errorHandling: 'manual' })
// Load the AWS SDK for Node.js
var aws = require('aws-sdk');
// Set the region
aws.config.update({ region: 'us-east-1' });

// Create an SQS service object
var sqs = new aws.SQS({apiVersion: '2012-11-05'});
require('dotenv').config();

const appcontroller = require("../controllers/appController");
const billcontroller = require("../controllers/billController");
const filecontroller = require("../controllers/fileController");



var queueURL = process.env.QueueUrl;
router.get('/check', function (req, res, next) {
  res.status(200).json({
      "message": "Check Successful"
  });
});

var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 10,
 MessageAttributeNames: [
   "email_address",
    "DueDate"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 20,
 WaitTimeSeconds: 0
};
console.log("params value in recieve message",params);
sqs.receiveMessage(params, function(err, data) {
  
  if (err) {
    console.log("Receive Error", err);

  } else if (data.Messages) {
    console.log("recieve message data....",data);
    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }
});

router.post('/user', appcontroller.register);
router.get('/user/self', appcontroller.login);
router.put('/user/self', appcontroller.update);
router.post('/bill', billcontroller.registerBill);
router.get('/bill/:id', billcontroller.getBillById);
router.put('/bill/:id', billcontroller.updateBill);
router.get('/bills/', billcontroller.getBills);
router.delete('/bill/:id', billcontroller.deleteBill);

router.get('/bills/due/:x', billcontroller.myBillFunction);

router.post('/bill/:id/file', upload.single('fileUpload'), function (err, req, res, next) {
    console.error(err.stack)
    res.status(400).send({meesage:'Bad Request ,Formdata is not correct! use fileUpload as key'})
  } ,filecontroller.addFile );
//router.post('/bill/:id/file', filecontroller.addFile);

  router.get('/bill/:billId/file/:fileId', filecontroller.getFile);
  router.delete('/bill/:billId/file/:fileId', filecontroller.deleteFile);
  

module.exports = router;
