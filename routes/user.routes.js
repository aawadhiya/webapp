const express = require("express");
const router = express.Router();

const appcontroller = require("../controllers/appController");
router.post('/user', appcontroller.register);
router.get('/user/self', appcontroller.login);
router.put('/user/self', appcontroller.update);

module.exports = router;