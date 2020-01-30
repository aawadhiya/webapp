const express = require("express");
const router = express.Router();

const appcontroller = require("../controllers/appController");
const billcontroller = require("../controllers/billController");

router.post('/user', appcontroller.register);
router.get('/user/self', appcontroller.login);
router.put('/user/self', appcontroller.update);
router.post('/bill', billcontroller.registerBill);
router.get('/bill/:id', billcontroller.getBillById);
router.put('/bill/:id', billcontroller.updateBill);
router.get('/bills/', billcontroller.getBills);
router.delete('/bill/:id', billcontroller.deleteBill);



module.exports = router;
