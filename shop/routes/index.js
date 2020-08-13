const express = require("express");
const bodyParser = require('body-parser');
const rootRoutes = require('./root')
const adminRoutes = require('./admin')
const userRoutes = require('./user')
const router = express.Router();
const {routes, publicRoutes, generateParamUrl} = require('../utils/routes')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use((req, res, next) => {
    res.locals.publicRoutes = publicRoutes
    res.locals.generateParamUrl = generateParamUrl
    next()
})
router.use(routes.root.get.root, rootRoutes)
router.use(routes.admin.prefix, adminRoutes)
router.use(routes.user.prefix, userRoutes)

module.exports = router;