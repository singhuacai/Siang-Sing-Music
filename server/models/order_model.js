const { TAPPAY_PARTNER_KEY } = process.env;
const { pool } = require("./mysql");
const got = require("got");
const validator = require("validator");
const moment = require("moment");

const checkConcertByConcertDateId = async (concertDateId) => {
  try {
    const queryStr = `SELECT count(*) AS count FROM concert_date WHERE id = ?`;
    const bindings = [concertDateId];
    const [result] = await pool.query(queryStr, bindings);
    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const checkConcertByConcertAreaPriceId = async (concertAreaPriceId) => {
  try {
    const queryStr = `SELECT count(*) AS count FROM concert_seat_info WHERE concert_area_price_id = ?`;
    const bindings = [concertAreaPriceId];
    const [result] = await pool.query(queryStr, bindings);
    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getTitleAndAreaImage = async (concertDateId) => {
  const queryStr = `
    SELECT
      cd.concert_datetime AS concertDatetime,
      ci.concert_title AS concertTitle,
      ci.concert_location AS concertLocation,
      ci.concert_area_image AS concertAreaImage
    FROM
      concert_info AS ci
    INNER JOIN
      concert_date AS cd
    on ci.id = cd.concert_id
    WHERE cd.id = ?
    `;
  const bindings = [concertDateId];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

const getAreasAndTicketPrices = async (concertDateId) => {
  const queryStr = `
  SELECT
    cap.id AS concertAreaPriceId, 
    cap.concert_area AS concertArea, 
    cap.ticket_price AS ticketPrice, 
    count(csi.status = 'not-selected' or null) AS totalSeats
  FROM
    concert_area_price cap
  INNER JOIN
    concert_seat_info csi
  ON cap.id = csi.concert_area_price_id
  WHERE cap.concert_date_id = ?
  GROUP BY concertArea, ticketPrice;
    `;
  const bindings = [concertDateId];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

const getSoldandCartCount = async (concertAreaPriceId, userId) => {
  /* Given concertAreaPriceId
     => get concertDateId
     => Get the number of seats belonging to this user */

  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const queryStr = `
    WITH ConcertDateId AS (
      SELECT DISTINCT
        cap.concert_date_id
      FROM concert_area_price cap
      INNER JOIN concert_seat_info csi
        ON cap.id = csi.concert_area_price_id
      where cap.id=?
    )
    SELECT
      count(*) as count
    FROM  ConcertDateId cdi
    INNER JOIN concert_area_price cap
      ON cdi.concert_date_id = cap.concert_date_id
    INNER JOIN concert_seat_info csi
      ON cap.id = csi.concert_area_price_id
    WHERE csi.user_id = ? AND csi.status in ('cart', 'sold') FOR UPDATE;
    `;
    const bindings = [concertAreaPriceId, userId];
    const [result] = await conn.query(queryStr, bindings);

    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getSeatStatus = async (concertAreaPriceId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const queryStr = `
      select
        id AS concertSeatId,
        seat_row AS seatRow,
        user_id AS userId,
        status
      FROM concert_seat_info
      where concert_area_price_id = ? FOR UPDATE;
    `;
    const bindings = [concertAreaPriceId];
    const [result] = await conn.query(queryStr, bindings);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getChosenConcertInfo = async (concertAreaPriceId) => {
  const queryStr = `
    SELECT 
      ci.concert_title AS concertTitle,
      cd.concert_datetime AS concertDatetime,
      ci.concert_location AS concertLocation,
      cap.concert_area AS concertArea,
      cap.ticket_price AS ticketPrice
    FROM concert_info ci
    INNER JOIN concert_date cd
      ON ci.id = cd.concert_id
    INNER JOIN concert_area_price cap
      ON cd.id = cap.concert_date_id
    WHERE cap.id = ?;
    `;
  const bindings = [concertAreaPriceId];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

const chooseSeat = async (concertSeatId, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [status] = await conn.query(
      "SELECT status FROM concert_seat_info WHERE id = ? FOR UPDATE",
      [concertSeatId]
    );

    if (status[0].status !== "not-selected") {
      await conn.query("ROLLBACK");
      return { error: "此座位已被選走囉!" };
    }

    const [count] = await conn.query(
      `
      WITH ConcertDateId AS(
        SELECT 
          cap.concert_date_id
        FROM concert_seat_info csi
        INNER JOIN concert_area_price cap
          ON cap.id = csi.concert_area_price_id
        WHERE csi.id = ?
      )
      SELECT 
        count(*) AS count
      FROM  ConcertDateId cdi
      INNER JOIN concert_area_price cap
        ON cdi.concert_date_id = cap.concert_date_id
      INNER JOIN concert_seat_info csi
        ON cap.id = csi.concert_area_price_id
      WHERE csi.user_id = ? AND csi.status !='not-selected';
      `,
      [concertSeatId, userId]
    );
    if (count[0].count >= 4) {
      await conn.query("ROLLBACK");
      return { error: "每人每場限購四張，您已達到選位上限!!!" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='selected', user_id = ?, user_updated_status_datetime = CURRENT_TIMESTAMP() where id = ?",
      [userId, concertSeatId]
    );
    await conn.query("COMMIT");
    return {
      seatId: concertSeatId,
      status: "selected",
    };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const deleteSeat = async (concertSeatId, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "SELECT status, user_id FROM concert_seat_info WHERE id = ? FOR UPDATE",
      [concertSeatId]
    );

    if (result[0].status === "not-selected") {
      await conn.query("ROLLBACK");
      return { error: "此座位早已被您取消選擇囉!" };
    }

    if (result[0].status === "sold" || result[0].status === "cart") {
      await conn.query("ROLLBACK");
      return { error: "您無法於此頁刪除此座位的預訂喔!" };
    }

    if (result[0].user_id !== userId) {
      await conn.query("ROLLBACK");
      return { error: "您無權限取消選擇此座位!" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id =NULL , user_updated_status_datetime = NULL where id = ?",
      [concertSeatId]
    );
    await conn.query("COMMIT");
    return {
      seatId: concertSeatId,
      status: "not-selected",
    };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const rollBackChoose = async (chosenSeats, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const queryStr =
      "SELECT id, status, user_id FROM concert_seat_info WHERE id IN(?) ORDER BY id FOR UPDATE";
    const bindings = [chosenSeats];
    const [check] = await pool.query(queryStr, bindings);

    // check userId and seatStatus => release the seats that the user selected
    let rollBackSeats = [];
    for (let i = 0; i < check.length; i++) {
      if (check[i].user_id === userId && check[i].status === "selected") {
        rollBackSeats.push(check[i].id);
      }
    }

    if (rollBackSeats.length === 0) {
      await conn.query("ROLLBACK");
      return { result: "需清空的座位是空的" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id = NULL , user_updated_status_datetime = NULL where id IN (?)",
      [rollBackSeats]
    );
    await conn.query("COMMIT");
    return { rollBackSeats };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const addToCart = async (chosenSeats, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const queryStr =
      "SELECT id, status, user_id FROM concert_seat_info WHERE id IN(?) ORDER BY id FOR UPDATE";
    const bindings = [chosenSeats];
    const [check] = await pool.query(queryStr, bindings);

    // make sure the userId => add the chosenSeats into cart
    let addToCartSeats = [];
    let insertData = [];
    for (let i = 0; i < check.length; i++) {
      if (check[i].user_id === userId && check[i].status === "selected") {
        addToCartSeats.push(check[i].id);
        const post = [chosenSeats[i], "add-to-cart"];
        insertData.push(post);
      }
    }
    if (addToCartSeats.length === 0) {
      return { error: "您欲加入購物車的座位選擇是空的" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='cart' where id IN (?)",
      [addToCartSeats]
    );

    await conn.query(
      "INSERT INTO shopping_cart (concert_seat_id, status) VALUES ?",
      [insertData]
    );

    await conn.query("COMMIT");
    return { addToCartSeats };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getCartStatus = async (userId) => {
  try {
    const queryStr = `
        SELECT
        sc.id AS shoppingCartId,
        csi.id AS concertSeatId,
        ci.concert_title AS concertTitle,
        ci.concert_location AS concertLocation,
        cd.concert_datetime AS concertDatetime,
        cap.concert_area AS concertArea,
        csi.seat_row AS seatRow,
        csi.seat_column AS seatColumn,
        cap.ticket_price AS ticketPrice
        FROM  
        concert_info ci
        INNER JOIN concert_date cd
          ON ci.id = cd.concert_id
        INNER JOIN concert_area_price cap
          ON cd.id = cap.concert_date_id
        INNER JOIN concert_seat_info csi
          ON cap.id = csi.concert_area_price_id
        INNER JOIN shopping_cart sc
          ON csi.id = sc.concert_seat_id
        WHERE csi.user_id = ? AND csi.status = 'cart' AND sc.status = "add-to-cart";
        `;
    const bindings = [userId];
    const [result] = await pool.query(queryStr, bindings);

    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const removeItemFromCart = async (removeSeatId, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      `
      SELECT 
        csi.concert_area_price_id AS concertAreaPriceId,
        csi.status AS seatStatus, 
        csi.user_id , 
        sc.id AS shoppingCartId, 
        sc.status AS statusInCart
      FROM concert_seat_info csi
      INNER JOIN shopping_cart sc
        ON csi.id = sc.concert_seat_id 
      WHERE csi.id = ? FOR UPDATE;
      `,
      [removeSeatId]
    );
    if (result.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "此座位未曾出現在購物車中!" };
    }

    let removeFromCartInfo = [];
    for (let i = 0; i < result.length; i++) {
      const { seatStatus, statusInCart } = result[i];
      if (seatStatus === "cart" && statusInCart === "add-to-cart") {
        removeFromCartInfo.push(result[i]);
      }
    }

    if (removeFromCartInfo.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "此座位無法從購物車被移除!" };
    }

    // make sure userId
    if (removeFromCartInfo[0].user_id !== userId) {
      await conn.query("ROLLBACK");
      return { error: "您無權將此座位從購物車移除!" };
    }

    // change the status of the seat in the concert_seat_info table to "not-selected"
    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id = NULL , user_updated_status_datetime = NULL where id = ?",
      [removeSeatId]
    );

    // change the status in the shopping_cart table to 'remove-from-cart'
    await conn.query(
      "UPDATE shopping_cart SET status ='remove-from-cart' where  id = ? ",
      [removeFromCartInfo[0].shoppingCartId]
    );

    await conn.query("COMMIT");

    return {
      concertAreaPriceId: removeFromCartInfo[0].concertAreaPriceId,
      removeFromCartSeatId: removeSeatId,
    };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getSeatInfo = async (conn, shoppingCartSeat) => {
  let queryStr = `
  SELECT 
    csi.concert_area_price_id AS concertAreaPriceId,
    csi.id AS concertSeatId,
    csi.user_id AS userId,
    csi.status AS concertSeatStatus,
    sc.status AS shoppingCartStatus
  FROM concert_seat_info csi
  INNER JOIN shopping_cart sc
    ON csi.id = sc.concert_seat_id
  WHERE sc.id IN (?) 
  ORDER BY sc.id FOR UPDATE
`;
  let bindings = [shoppingCartSeat];
  const [check] = await conn.query(queryStr, bindings);
  return check;
};

const getSubtotal = async (conn, orderSeatId) => {
  queryStr = `
    SELECT sum(ticket_price) AS subtotal
    FROM concert_area_price cap
    INNER JOIN concert_seat_info csi
      ON cap.id = csi.concert_area_price_id
    WHERE csi.id IN (?);
  `;
  bindings = [orderSeatId];
  const [subtotal] = await conn.query(queryStr, bindings);
  return subtotal;
};

const addMainOrderRecord = async (conn, user, order) => {
  const now = new Date();
  const mainOrderCode =
    "" +
    now.getMonth() +
    now.getDate() +
    (now.getTime() % (24 * 60 * 60 * 1000)) +
    Math.floor(Math.random() * 10);
  const mainOrderRecord = {
    user_id: user.id,
    main_order_code: mainOrderCode,
    order_status: "待出貨",
    payment_status: "paid",
    payment: order.payment,
    shipping: order.shipping,
    subtotal: order.subtotal,
    freight: order.freight,
    total: order.total,
    details: validator.blacklist(JSON.stringify(order.recipient), "<>"),
  };
  const [result] = await conn.query(
    "INSERT INTO main_order SET ?",
    mainOrderRecord
  );
  return { mainOrderCode, result };
};

const addSubOrderRecord = async (conn, mainOrderId, shoppingCartSeat) => {
  let subOrderRecord = [];
  shoppingCartSeat.forEach((element) => {
    subOrderRecord.push([mainOrderId, element]);
  });
  await conn.query(
    "INSERT INTO sub_order (main_order_id, shopping_cart_id) VALUES ?",
    [subOrderRecord]
  );
};

const addPaymentRecord = async (
  conn,
  paymentResult,
  mainOrderId,
  user,
  order
) => {
  const otherData = {
    acquirer: paymentResult.acquirer,
    currency: paymentResult.currency,
    card_info: paymentResult.card_info,
    bank_transaction_time: paymentResult.bank_transaction_time,
    bank_result_code: paymentResult.bank_result_code,
    bank_result_msg: paymentResult.bank_result_msg,
    card_identifier: paymentResult.card_identifier,
    transaction_method_details: paymentResult.transaction_method_details,
  };

  bindings = {
    main_order_id: mainOrderId,
    payment: order.payment,
    amount: paymentResult.amount,
    name: user.name,
    email: user.email,
    address: null,
    phone: user.phone,
    transaction_time_millis: paymentResult.transaction_time_millis,
    rec_trade_id: paymentResult.rec_trade_id,
    bank_transaction_id: paymentResult.bank_transaction_id,
    other_data: JSON.stringify(otherData),
  };
  await conn.query("INSERT INTO payment SET ?", bindings);
};

const checkout = async (data, user) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    // 1. Check the user's permissions
    const check = await getSeatInfo(conn, data.order.shoppingCartSeat);
    if (check.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "無法在購物車中找到您預訂的此座位!" };
    }

    let orderSeatId = [];
    let concertAreaPriceIds = [];
    check.forEach((element) => {
      const {
        userId,
        concertSeatStatus,
        shoppingCartStatus,
        concertSeatId,
        concertAreaPriceId,
      } = element;
      if (
        userId === user.id &&
        concertSeatStatus === "cart" &&
        shoppingCartStatus === "add-to-cart"
      ) {
        orderSeatId.push(concertSeatId);
        concertAreaPriceIds.push(concertAreaPriceId);
      }
    });

    if (orderSeatId.length !== check.length) {
      await conn.query("ROLLBACK");
      return { error: "您無法權限預訂這些座位!" };
    }

    // 2. check the subtotal
    const subtotal = await getSubtotal(conn, orderSeatId);
    if (parseInt(subtotal[0].subtotal) !== data.order.subtotal) {
      await conn.query("ROLLBACK");
      return { error: "總票價有誤!" };
    }

    // 3.checkout by TayPay
    let paymentResult;
    paymentResult = await payOrderByPrime(
      TAPPAY_PARTNER_KEY,
      data.prime,
      data.order,
      user
    );
    if (paymentResult.status != 0) {
      await conn.query("ROLLBACK");
      return { error: "Invalid prime" };
    }

    // 4. change the seat status in the concert_seat_info table
    await conn.query(
      "UPDATE concert_seat_info SET status ='sold' where id IN (?)",
      [orderSeatId]
    );

    // 5. change the status in the shopping_cart table
    await conn.query(
      "UPDATE shopping_cart SET status ='remove-to-order' where  id IN (?) ",
      [data.order.shoppingCartSeat]
    );

    // 6. add record of main order
    const mainOrder = await addMainOrderRecord(conn, user, data.order);
    const { mainOrderCode, result } = mainOrder;
    const mainOrderId = result.insertId;

    // 7. add record of sub order
    await addSubOrderRecord(conn, mainOrderId, data.order.shoppingCartSeat);

    // 8. add record of payment
    await addPaymentRecord(conn, paymentResult, mainOrderId, user, data.order);

    await conn.query("COMMIT");
    return {
      mainOrderCode,
      concertAreaPriceIds,
      orderSeatId,
      ordererName: user.name,
      ordererEmail: user.email,
      orderTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      orderStatus: "待出貨",
      paymentStatus: "paid",
      shipping: data.order.shipping,
      subtotal: data.order.subtotal,
      freight: data.order.freight,
      total: data.order.total,
      recipientName: data.order.recipient.name,
      recipientPhone: data.order.recipient.phone,
      recipientAddress: data.order.recipient.address,
    };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getOrderResultByOrderNum = async (mainOrderCode, userId) => {
  try {
    const queryStr = `
      SELECT
        sc.id AS shoppingCartId,
        csi.id AS concertSeatId,
        ci.concert_title AS concertTitle,
        ci.concert_location AS concertLocation,
        cd.concert_datetime AS concertDatetime,
        cap.concert_area AS concertArea,
        csi.seat_row AS seatRow,
        csi.seat_column AS seatColumn,
        cap.ticket_price AS ticketPrice
      FROM  
      concert_info ci
      INNER JOIN concert_date cd
        ON ci.id = cd.concert_id
      INNER JOIN concert_area_price cap
        ON cd.id = cap.concert_date_id
      INNER JOIN concert_seat_info csi
        ON cap.id = csi.concert_area_price_id
      INNER JOIN shopping_cart sc
        ON csi.id = sc.concert_seat_id
      INNER JOIN sub_order so
        ON sc.id = so.shopping_cart_id
      INNER JOIN main_order mo
        ON so.main_order_id = mo.id
      WHERE mo.main_order_code = ? AND csi.status = 'sold' AND sc.status = "remove-to-order" AND csi.user_id = ?;
    `;
    const bindings = [mainOrderCode, userId];
    const [result] = await pool.query(queryStr, bindings);
    if (result.length === 0) {
      return { error: "您無權限查看此訂單結果" };
    }
    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getOrderResultByUserId = async (userId) => {
  try {
    const queryStr = `
        SELECT
        mo.main_order_code AS mainOrderCode,
        mo.order_status AS orderStatus,
        mo.created_at AS createdAt, 
        JSON_ARRAYAGG(
        JSON_OBJECT(
          "concertTitle", ci.concert_title,
          "concertLocation", ci.concert_location,
          "concertDatetime", cd.concert_datetime,
          "shoppingCartId", sc.id,
          "concertSeatId", csi.id,
          "concertArea", cap.concert_area,
          "row", csi.seat_row,
          "column", csi.seat_column,
          "ticketPrice",cap.ticket_price
        )) AS ticketInfo
        FROM  
        concert_info ci
        INNER JOIN concert_date cd
          ON ci.id = cd.concert_id
        INNER JOIN concert_area_price cap
          ON cd.id = cap.concert_date_id
        INNER JOIN concert_seat_info csi
          ON cap.id = csi.concert_area_price_id
        INNER JOIN shopping_cart sc
          ON csi.id = sc.concert_seat_id
        INNER JOIN sub_order so
          ON sc.id = so.shopping_cart_id
        INNER JOIN main_order mo
          ON so.main_order_id = mo.id
        WHERE csi.status = 'sold' AND sc.status = "remove-to-order" AND csi.user_id = ?
        GROUP BY mo.main_order_code, mo.order_status,mo.created_at
        ORDER BY mo.created_at DESC;
        `;
    const bindings = [userId];
    const [result] = await pool.query(queryStr, bindings);
    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const payOrderByPrime = async function (tappayKey, prime, order, user) {
  let res = await got.post(
    "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": tappayKey,
      },
      json: {
        prime: prime,
        partner_key: tappayKey,
        merchant_id: "AppWorksSchool_CTBC",
        details: "Ticketing System Payment",
        amount: order.total,
        cardholder: {
          phone_number: user.phone,
          name: user.name,
          email: user.email,
        },
        remember: false,
      },
      responseType: "json",
    }
  );
  return res.body;
};

const filterReleasedTickets = async () => {
  try {
    const queryStr = `
      select 
        csi.id AS concertSeatId
      from concert_seat_info csi
      INNER JOIN shopping_cart sc
        on csi.id = sc.concert_seat_id
      WHERE csi.status = 'cart' 
      AND sc.status = 'add-to-cart' 
      AND csi.user_updated_status_datetime < CURRENT_TIMESTAMP - INTERVAL 1 HOUR
      ORDER BY csi.id;
      `;
    const [result] = await pool.query(queryStr);
    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const releaseTickets = async (tickets) => {
  if (tickets.length === 0) {
    return { error: "沒有需清除的票" };
  }
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      `
      SELECT
        csi.concert_area_price_id AS concertAreaPriceId,
        csi.id AS concertSeatId,
        csi.status AS seatStatus,
        sc.id AS shoppingCartId,
        sc.status AS statusInCart
      FROM concert_seat_info csi
      INNER JOIN shopping_cart sc
        ON csi.id = sc.concert_seat_id
      WHERE csi.id in (?) FOR UPDATE;
      `,
      [tickets]
    );

    let shoppingCartIds = [];
    let concertSeatIds = [];
    let concertAreaPriceIds = [];
    for (let i = 0; i < result.length; i++) {
      if (
        result[i].seatStatus === "cart" &&
        result[i].statusInCart === "add-to-cart"
      ) {
        concertAreaPriceIds.push(result[i].concertAreaPriceId);
        concertSeatIds.push(result[i].concertSeatId);
        shoppingCartIds.push(result[i].shoppingCartId);
      }
    }

    if (concertSeatIds.length !== shoppingCartIds.length) {
      await conn.query("ROLLBACK");
      return { error: "座位資訊有錯!" };
    }

    if (concertSeatIds.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "沒有需清除的票" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id = NULL , user_updated_status_datetime = NULL where id IN (?)",
      [concertSeatIds]
    );

    await conn.query(
      "UPDATE shopping_cart SET status ='remove-from-cart' where  id IN (?) ",
      [shoppingCartIds]
    );
    await conn.query("COMMIT");
    return { concertAreaPriceIds, concertSeatIds };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = {
  getTitleAndAreaImage,
  checkConcertByConcertDateId,
  checkConcertByConcertAreaPriceId,
  getAreasAndTicketPrices,
  getSoldandCartCount,
  getSeatStatus,
  getChosenConcertInfo,
  chooseSeat,
  deleteSeat,
  rollBackChoose,
  addToCart,
  getCartStatus,
  removeItemFromCart,
  checkout,
  getOrderResultByOrderNum,
  getOrderResultByUserId,
  filterReleasedTickets,
  releaseTickets,
};
