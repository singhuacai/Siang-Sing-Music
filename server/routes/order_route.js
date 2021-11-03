const router = require("express").Router();
const { wrapAsync, authentication, parseSocketId } = require("../../util/util");
const {
  getPerformanceAndAreas,
  getSeatStatus,
  getChosenConcertInfo,
  chooseOrDeleteSeat,
  rollBackChoose,
  addToCart,
  getCartStatus,
  removeItemFromCart,
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
  .post(authentication(), parseSocketId(), wrapAsync(chooseOrDeleteSeat));

router
  .route("/order/rollBackChoose")
  .post(authentication(), parseSocketId(), wrapAsync(rollBackChoose));

router
  .route("/order/addToCart")
  .post(authentication(), parseSocketId(), wrapAsync(addToCart));

router
  .route("/order/cartStatus")
  .get(authentication(), wrapAsync(getCartStatus));

router
  .route("/order/removeItemFromCart")
  .get(authentication(), wrapAsync(removeItemFromCart));

module.exports = router;
