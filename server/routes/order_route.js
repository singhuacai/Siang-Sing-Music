const router = require("express").Router();
const { wrapAsync, authentication } = require("../../util/util");
const { getPerformanceAndAreas } = require("../controllers/order_controller");

router
  .route("/order/performanceAndAreas")
  .get(authentication(), wrapAsync(getPerformanceAndAreas));

module.exports = router;
