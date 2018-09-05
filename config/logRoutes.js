const express = require('express');
const router = express.Router();
const ctrl = require('../controllers');

module.exports = router
        // route: /api/log/ method: get
    .get (      '/',    ctrl.log.getUserTrades)
        // route: /api/log/ method: post
    .post(      '/',    ctrl.log.postUserTrades)
        // route: /api/log/:id  method: delete
    .delete(    '/:id', ctrl.log.deleteOneLog);