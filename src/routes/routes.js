let express = require("express");
let router = express.Router();

// Controller's
let IceCreamController = require("../controllers/IceCreamController");

// Middleware
const authentication = require('../middlewares/auth');

// GET's
router.get('/icecreams', IceCreamController.getAll);
router.get('/icecream/:id', IceCreamController.getById);
router.get('/metrics', authentication, IceCreamController.getMetrics);

// POST's
router.post('/icecream', authentication, IceCreamController.create);
router.post('/buy', authentication, IceCreamController.buy);
router.post('/sell', authentication, IceCreamController.sell);
router.post('/subtract', authentication, IceCreamController.subtract);

// PUT's
router.put('/icecream', authentication, IceCreamController.edit);

// DELETE's
router.delete('/icecream/:id', authentication, IceCreamController.delete);

module.exports = router;