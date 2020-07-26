const express = require("express");
const bodyParser = require('body-parser');
const rootRoutes = require('./root')
const adminRoutes = require('./admin')
const userRoutes = require('./user')
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use("/", rootRoutes)
router.use("/admin", adminRoutes)
router.use("/user", userRoutes)

module.exports = router;