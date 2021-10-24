const router = require("express").Router();
const { wrapAsync, authentication } = require("../../util/util");
const {
  getPerformanceAndAreas,
  getSeatStatus,
  getChosenConcertInfo,
  chooseOrDeleteSeat,
} = require("../controllers/order_controller");

router
  .route("/order/performanceAndAreas")
  .get(authentication(), wrapAsync(getPerformanceAndAreas));

router
  .route("/order/seatStatus")
  .get(authentication(), wrapAsync(getSeatStatus));

router
  .route("/order/chosenConcertInfo")
  .get(authentication(), wrapAsync(getChosenConcertInfo));

router
  .route("/order/chooseOrDeleteSeat")
  .post(authentication(), wrapAsync(chooseOrDeleteSeat));

module.exports = router;
