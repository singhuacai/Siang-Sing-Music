const router = require("express").Router();
const { wrapAsync, authentication, parseSocketId } = require("../../util/util");
const { role } = require("../models/user_model");
const {
  getPerformanceAndAreas,
  getSeatStatus,
  getChosenConcertInfo,
  chooseOrDeleteSeat,
  rollBackChoose,
  addToCart,
  getCartStatus,
  removeItemFromCart,
  checkout,
  getOrderResult,
  postReleaseTicketsResult,
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
  .post(authentication(), wrapAsync(removeItemFromCart));

router
  .route("/order/checkout")
  .post(authentication(role.ALL), wrapAsync(checkout));

router
  .route("/order/orderResult")
  .get(authentication(role.ALL), wrapAsync(getOrderResult));

router.route("/order/ReleaseTickets").post(wrapAsync(postReleaseTicketsResult));

module.exports = router;
