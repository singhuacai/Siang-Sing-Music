const offsetHours = process.env.TIMEZONE_OFFSET || 8;
const Order = require("../models/order_model");
const Mail = require("../controllers/mail_controller");
const { notifyReleaseTickets } = require("../../socket");
const { adjustTimeZone } = require("../../util/util");
const {
  BOARDCAST,
  notifySeatSelected,
  notifySeatDeleted,
  notifyRollbackSeat,
  notifyAddToCart,
  notifyRemoveFromCart,
  notifyRemoveToOrder,
} = require("../../socket");

const getPerformanceAndAreas = async (req, res) => {
  const { concertId, concertDateId } = req.query;

  let [result] = await Order.checkConcertByConcertDateId(concertDateId);
  if (result.count === 0) {
    res.status(400).send({ error: "Bad request!" });
    return;
  }

  result = await Order.getTitleAndAreaImage(concertDateId);
  if (!result[0]) {
    res.status(400).send({ error: "Bad request!" });
    return;
  }

  result.map((v) => {
    v.concertAreaImage = `/${concertId}/${v.concertAreaImage}`;
    v.concertDatetime = adjustTimeZone(v.concertDatetime, offsetHours);
    return v;
  });

  const areasAndTicketPrices = await Order.getAreasAndTicketPrices(
    concertDateId
  );

  const { concertTitle, concertLocation, concertAreaImage, concertDatetime } =
    result[0];
  res.status(200).send({
    concertTitle,
    concertLocation,
    concertAreaImage,
    concertDatetime,
    areasAndTicketPrices,
  });
};

const getSeatStatus = async (req, res) => {
  const { concertAreaPriceId } = req.query;
  const userId = req.user.id;

  let result = await Order.checkConcertByConcertAreaPriceId(concertAreaPriceId);
  if (result[0].count === 0) {
    res.status(400).send({ error: "Bad request!" });
    return;
  }

  let data = await Order.getSeatStatus(concertAreaPriceId);
  if (data.error || !data) {
    res.status(500);
    return;
  }

  data.map((v) => {
    if (v.status === "selected" && v.userId === userId) {
      v.status = "you-selected";
    }
    if (v.status === "cart" && v.userId === userId) {
      v.status = "you-cart";
    }
    if (v.status === "sold" && v.userId === userId) {
      v.status = "you-sold";
    }
    return v;
  });

  result = await Order.getSoldandCartCount(concertAreaPriceId, userId);
  if (result.error || !result) {
    res.status(500);
    return;
  }

  const countOfCartAndSold = result[0].count;
  res.status(200).send({ countOfCartAndSold, data });
  return;
};

const getChosenConcertInfo = async (req, res) => {
  const { concertAreaPriceId } = req.query;
  let result = await Order.checkConcertByConcertAreaPriceId(concertAreaPriceId);
  if (result[0].count === 0) {
    res.status(400).send({ error: "Bad request!" });
    return;
  }

  let data = await Order.getChosenConcertInfo(concertAreaPriceId);
  if (data.error || !data) {
    res.status(500);
    return;
  }
  data.map((v) => {
    v.concertDatetime = adjustTimeZone(v.concertDatetime, offsetHours);
    return v;
  });

  res.status(200).send({ data });
  return;
};

const chooseOrDeleteSeat = async (req, res) => {
  const { seatStatus, concertSeatId } = req.body;
  const userId = req.user.id;
  const userCode = req.user.user_code;

  if (!concertSeatId) {
    res.status(400).send({ error: "請提供concertSeatId！" });
    return;
  }

  if (seatStatus !== 0 && seatStatus !== 1) {
    res.status(400).send({ error: "seatStatus 錯誤！" });
    return;
  }

  let result;
  if (seatStatus === 1) {
    result = await Order.chooseSeat(concertSeatId, userId);
  } else if (seatStatus === 0) {
    result = await Order.deleteSeat(concertSeatId, userId);
  }

  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  } else {
    const msg = JSON.stringify({
      owner: userCode,
      concert_area_price_id: result.concert_area_price_id,
      seat_id: result.seat_id,
    });
    if (result.status === "selected") {
      notifySeatSelected(req.socketId, msg, BOARDCAST.ALL_USERS_IN_ROOM);
    } else if (result.status === "not-selected") {
      notifySeatDeleted(req.socketId, msg, BOARDCAST.ALL_USERS_IN_ROOM);
    }
    res.status(200).send(result);
    return;
  }
};

const rollBackChoose = async (req, res) => {
  const { chosenSeats } = req.body;
  const userId = req.user.id;
  const userCode = req.user.user_code;

  if (!chosenSeats) {
    res.status(400).send({ error: "請提供所選的座位" });
    return;
  }

  if (chosenSeats.length === 0) {
    res.status(400).send({ error: "您尚未選擇座位" });
    return;
  }

  // 利用 rollBackChoose function
  // 1. 查詢該座位目前的狀態是否為 selected 以及是否為同一個使用者
  // 2. 若是同一個使用者，再把座位狀態還原為not-selected狀態!
  result = await Order.rollBackChoose(chosenSeats, userId);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  } else {
    const msg = JSON.stringify({
      owner: userCode,
      rollBackSeat: result.rollBackSeat,
    });
    notifyRollbackSeat(req.socketId, msg, BOARDCAST.ALL_USERS_IN_ROOM);
    res.status(200).send(result);
    return;
  }
};

const addToCart = async (req, res) => {
  const { chosenSeats } = req.body;
  const userId = req.user.id;
  const userCode = req.user.user_code;

  if (!chosenSeats) {
    res.status(400).send({ error: "請提供所選的座位" });
    return;
  }

  if (chosenSeats.length === 0) {
    res.status(400).send({ error: "您尚未選擇座位" });
    return;
  }

  if (chosenSeats.length > 4) {
    res.status(400).send({ error: "您已超過選位上限!" });
    return;
  }

  // 利用 addToCart function
  // 1. 查詢該座位目前的狀態是否為 selected 以及是否為同一個使用者
  // 2. 若是同一個使用者，再把座位狀態更改為cart狀態!
  result = await Order.addToCart(chosenSeats, userId);

  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  } else {
    const msg = JSON.stringify({
      owner: userCode,
      concert_area_price_id: result.concert_area_price_id,
      addToCartSeat: result.addToCartSeat,
    });
    notifyAddToCart(req.socketId, msg, BOARDCAST.ALL_USERS_IN_ROOM);
    res.status(200).send(result);
    return;
  }
};

const getCartStatus = async (req, res) => {
  const userId = req.user.id;
  // TODO: 利用 userId 到 DB 查詢：該使用者已加入購物車的演唱會座位資訊
  let cartStatus = await Order.getCartStatus(userId);
  if (cartStatus.error) {
    res.status(403).send({ error: cartStatus.error });
    return;
  }

  cartStatus.map((v) => {
    v.concert_datetime = adjustTimeZone(v.concert_datetime, offsetHours);
    return v;
  });

  res.status(200).send({ cartStatus });
  return;
};

const removeItemFromCart = async (req, res) => {
  const { deleteSeatId } = req.body;
  const userId = req.user.id;
  const userCode = req.user.user_code;

  if (!deleteSeatId) {
    res.status(400).send({ error: "請提供欲刪除的座位" });
    return;
  }

  // 利用 deleteSeatId 先到 concert_seat_info table 確認: 1. status 是否為 cart, 2.userId 是否與欲取消者相同
  // 兩個條件均符合後，再到 shopping cart table, 針對 deleteSeatId 去找到對應的 concert_seat_id 將其 status 更改為 remove-from-cart
  // res.status(200).send(result);

  result = await Order.removeItemFromCart(deleteSeatId, userId);

  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  } else {
    const msg = JSON.stringify({
      owner: userCode,
      concert_area_price_id: result.concert_area_price_id,
      removeFromCartSeat: result.remove_from_cart_seat_id,
    });
    notifyRemoveFromCart(msg);
    res.status(200).send({ result: `已將座位 ${deleteSeatId} 從購物車移除!` });
    return;
  }
};

const checkout = async (req, res) => {
  const { data } = req.body;
  const user = req.user;
  const userCode = req.user.user_code;

  if (!data) {
    res.status(400).send({ error: "請提供訂單資訊" });
    return;
  }
  result = await Order.checkout(data, user);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  } else {
    const msg = JSON.stringify({
      owner: userCode,
      concertAreaPriceIds: result.concertAreaPriceIds,
      removeToOrderSeat: result.orderSeatId,
    });

    // socket.io
    notifyRemoveToOrder(msg);

    // api response
    res.status(200).send({ mainOrderCode: result.mainOrderCode });

    // send email
    const sendInfo = {
      userName: result.ordererName,
      userEmail: result.ordererEmail,
      buyTime: result.orderTime,
      orderCode: result.mainOrderCode,
      orderStatus: result.order_status,
      shipping: result.shipping,
      subtotal: result.subtotal,
      freight: result.freight,
      total: result.total,
      recipientName: result.recipientName,
      recipientPhone: result.recipientPhone,
      recipientAddress: result.recipientAddress,
    };
    await Mail.sendEmail(sendInfo, Mail.mailType.FinishOrder);
    return;
  }
};

const getOrderResult = async (req, res) => {
  const { mainOrderCode } = req.query;
  const userId = req.user.id;
  if (mainOrderCode) {
    //TODO: 利用 mainOrderCode => 訂票結果
    result = await Order.getOrderResultByOrderNum(mainOrderCode, userId);
    if (result.error) {
      res.status(403).send({ error: result.error });
      return;
    }
    result.map((v) => {
      v.concert_datetime = adjustTimeZone(v.concert_datetime, offsetHours);
      return v;
    });
  } else {
    //TODO: 利用 userId => 所有訂票結果
    result = await Order.getOrderResultByUserId(userId);
    if (result.error) {
      res.status(403).send({ error: result.error });
      return;
    }
    result.map((v) => {
      v.ticket_info.map((v) => {
        v.concert_datetime = adjustTimeZone(v.concert_datetime, offsetHours);
      });
      v.created_at = adjustTimeZone(v.created_at, offsetHours);
      return v;
    });
  }
  res.status(200).send({ orderResult: result });
  return;
};

const postReleaseTicketsResult = async (req, res) => {
  let msg = req.body;
  notifyReleaseTickets(msg);
  res.status(200).send({ result: "finish release tickets!" });
  return;
};

module.exports = {
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
};
