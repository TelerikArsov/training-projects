const express = require("express");
const bodyParser = require('body-parser');
const rootRoutes = require('./root')
const adminRoutes = require('./admin')
const userRoutes = require('./user')
const router = express.Router();
const {routes} = require('../utils/routes')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(routes.root.prefix, rootRoutes)
router.use(routes.admin.prefix, adminRoutes)
router.use(routes.user.prefix, userRoutes)

module.exports = router;