let express = require("express");
let router = express.Router();

// Controller's
let IceCreamController = require("../controllers/IceCreamController");

// Middleware
const authentication = require('../middlewares/auth');

// GET's
router.get('/icecream', IceCreamController.getAll);
router.get('/icecream/:id', IceCreamController.getById);

// POST's
router.post('/icecream', authentication, IceCreamController.create);

// PUT's
router.put('/icecream', authentication, IceCreamController.edit);

// DELETE's
router.delete('/icecream', authentication, IceCreamController.delete);

module.exports = router;