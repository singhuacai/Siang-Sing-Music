const { TAPPAY_PARTNER_KEY } = process.env;
const { pool } = require("./mysql");
const got = require("got");
const validator = require("validator");
const moment = require("moment");

const checkConcertByConcertDateId = async (concertDateId) => {
  const queryStr = `
  SELECT
    count(*) AS count
  FROM
    concert_date
  WHERE
    id = ?
  `;
  const bindings = [concertDateId];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

const checkConcertByConcertAreaPriceId = async (concertAreaPriceId) => {
  console.log("pool(checkConcertByConcertDateId):");
  console.log(
    "all connections length:" +
      pool.pool.config.connectionConfig.pool._allConnections.length
  );
  console.log(
    "free connections length:" +
      pool.pool.config.connectionConfig.pool._freeConnections.length
  );
  console.log(
    "connection queue length:" +
      pool.pool.config.connectionConfig.pool._connectionQueue.length
  );
  console.log(
    "connections limit:" +
      pool.pool.config.connectionConfig.pool.config.connectionLimit
  );
  console.log(
    "queue limit:" + pool.pool.config.connectionConfig.pool.config.queueLimit
  );

  let [connectionNum] = await pool.query(
    "show status where variable_name = 'Threads_connected';"
  );
  console.log(connectionNum[0].Value);

  try {
    const queryStr = `
    SELECT
      count(*) AS count
    FROM
      concert_seat_info
    WHERE
    concert_area_price_id = ?
    `;
    const bindings = [concertAreaPriceId];
    const [result] = await pool.query(queryStr, bindings);
    console.log(
      "checkConcertByConcertAreaPriceId-------已確認是否有此場演唱會!"
    );
    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getConcertTitleAndAreaImage = async (concertDateId) => {
  const queryStr = `
    SELECT
      cd.concert_datetime,
      ci.concert_title,
      ci.concert_location,
      ci.concert_area_image
    FROM
      concert_info AS ci
    INNER JOIN
      concert_date AS cd
    on ci.id = cd.concert_id
    WHERE
      cd.id = ?
    `;
  const bindings = [concertDateId];
  const [concert_title] = await pool.query(queryStr, bindings);
  return concert_title;
};

const getAreasAndTicketPrices = async (concertDateId) => {
  const queryStr = `
  SELECT
    cap.id AS concert_area_price_id, cap.concert_area, cap.ticket_price, count(csi.status = 'not-selected' or null) AS total_seats
  FROM
    concert_area_price cap
  INNER JOIN
    concert_seat_info csi
  ON cap.id = csi.concert_area_price_id
  WHERE cap.concert_date_id = ?
  GROUP BY cap.concert_area, cap.ticket_price;
    `;
  const bindings = [concertDateId];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

const getSoldandCartCount = async (concertAreaPriceId, userId) => {
  // 利用 concertAreaPriceId => 找到 concertDateId
  // 利用找到的 concertDateId => 找出該使用者購買及加入購物車的總數
  // BEFORE ======================================
  console.log("pool:(getSoldandCartCount)");
  console.log(
    "all connections length:" +
      pool.pool.config.connectionConfig.pool._allConnections.length
  );
  console.log(
    "free connections length:" +
      pool.pool.config.connectionConfig.pool._freeConnections.length
  );
  console.log(
    "connection queue length:" +
      pool.pool.config.connectionConfig.pool._connectionQueue.length
  );
  console.log(
    "connections limit:" +
      pool.pool.config.connectionConfig.pool.config.connectionLimit
  );
  console.log(
    "queue limit:" + pool.pool.config.connectionConfig.pool.config.queueLimit
  );

  let [connectionNum] = await pool.query(
    "show status where variable_name = 'Threads_connected';"
  );
  console.log(connectionNum[0].Value);

  // ======================================
  const conn = await pool.getConnection();
  try {
    // AFTER ======================================
    [connectionNum] = await pool.query(
      "show status where variable_name = 'Threads_connected';"
    );
    console.log(connectionNum);
    // ======================================
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
    console.log(
      "getSoldandCartCount-------已取得該使用者已購買及已加入購物車的數量!"
    );
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
  console.log("pool:(getSeatStatus)");
  console.log(pool.pool.config.connectionConfig.pool._allConnections.length);
  console.log(pool.pool.config.connectionConfig.pool._freeConnections.length);
  console.log(pool.pool.config.connectionConfig.pool.config.connectionLimit);
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const queryStr = `
      select
        id AS concert_seat_id,
        seat_row,
        seat_column,
        status,
        user_id
      FROM
        concert_seat_info
      where
        concert_area_price_id = ? FOR UPDATE;
    `;
    const bindings = [concertAreaPriceId];
    const [result] = await conn.query(queryStr, bindings);
    console.log("getSeatStatus------已取得座位狀態!");
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
      ci.concert_title,
      cd.concert_datetime,
      ci.concert_location,
      cap.concert_area,
      cap.ticket_price
    FROM concert_info ci
    INNER JOIN concert_date cd
      ON ci.id = cd.concert_id
    INNER JOIN concert_area_price cap
      ON cd.id = cap.concert_date_id
    WHERE
      cap.id = ?;
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
      "SELECT concert_area_price_id, status FROM concert_seat_info WHERE id = ? FOR UPDATE",
      [concertSeatId]
    );

    if (status[0].status !== "not-selected") {
      await conn.query("ROLLBACK");
      return { error: "This seat has been selected!" };
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
      WHERE csi.user_id = ? AND csi.status !='not-selected'
      ;
      `,
      [concertSeatId, userId]
    );
    if (count[0].count >= 4) {
      await conn.query("ROLLBACK");
      return { error: "You have selected 4 seats!" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='selected', user_id = ?, user_updated_status_datetime = CURRENT_TIMESTAMP() where id = ?",
      [userId, concertSeatId]
    );

    console.log("已將status更改為selected了!");
    await conn.query("COMMIT");
    return {
      concert_area_price_id: status[0].concert_area_price_id,
      seat_id: concertSeatId,
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
      "SELECT concert_area_price_id, status, user_id FROM concert_seat_info WHERE id = ? FOR UPDATE",
      [concertSeatId]
    );

    // 此座位的狀態早就是 Not-selected 的了
    if (result[0].status === "not-selected") {
      await conn.query("ROLLBACK");
      return { error: "This seat has been not-selected already!" };
    }

    // 此座位的狀態若是 "Sold" 或 "cart" 的 => 無法取消
    if (result[0].status === "sold" || result[0].status === "cart") {
      await conn.query("ROLLBACK");
      return { error: "You CANNOT delete the order in this page!" };
    }

    // 確認"想取消此座位者"與"預訂者"為同一人
    if (result[0].user_id !== userId) {
      await conn.query("ROLLBACK");
      return { error: "You have no right to delete the order of the seat!" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id =NULL , user_updated_status_datetime = NULL where id = ?",
      [concertSeatId]
    );
    console.log("Seat cancelled!");
    await conn.query("COMMIT");
    return {
      concert_area_price_id: result[0].concert_area_price_id,
      seat_id: concertSeatId,
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
      "SELECT id, status, user_id, concert_area_price_id FROM concert_seat_info WHERE id IN(?) ORDER BY id FOR UPDATE";
    const bindings = [chosenSeats];
    const [check] = await pool.query(queryStr, bindings);

    // 確認你撈出來的 userId 與前台傳過來的 userId 是同一個 => 再去 rollback 該使用者剛剛選起來的位置
    let rollBackSeat = [];
    let concert_area_price_id;
    for (let i = 0; i < check.length; i++) {
      if (check[i].user_id === userId && check[i].status === "selected") {
        rollBackSeat.push(check[i].id);
        concert_area_price_id = check[i].concert_area_price_id;
      }
    }

    if (rollBackSeat.length === 0) {
      return { result: "rollBackSeat is empty" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id = NULL , user_updated_status_datetime = NULL where id IN (?)",
      [rollBackSeat]
    );

    console.log(`[rollBackSeat]:${rollBackSeat}`);
    await conn.query("COMMIT");
    return {
      concert_area_price_id,
      rollBackSeat,
    };
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
      "SELECT id, status, user_id, concert_area_price_id FROM concert_seat_info WHERE id IN(?) ORDER BY id FOR UPDATE";
    const bindings = [chosenSeats];
    const [check] = await pool.query(queryStr, bindings);

    // 確認你撈出來的 userId 與前台傳過來的 userId 是同一個 => 再去將該使用者剛剛選起來的位置加入購物車
    let addToCartSeat = [];
    let insertData = [];
    let concert_area_price_id;
    for (let i = 0; i < check.length; i++) {
      if (check[i].user_id === userId && check[i].status === "selected") {
        addToCartSeat.push(check[i].id);
        concert_area_price_id = check[i].concert_area_price_id;
        const post = [chosenSeats[i], "add-to-cart"];
        insertData.push(post);
      }
    }

    if (addToCartSeat.length === 0) {
      return { error: "addToCartSeat is empty" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='cart' where id IN (?)",
      [addToCartSeat]
    );

    await conn.query(
      "INSERT INTO shopping_cart (concert_seat_id, status) VALUES ?",
      [insertData]
    );

    await conn.query("COMMIT");
    return {
      concert_area_price_id,
      addToCartSeat,
    };
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
        ci.concert_title,
        ci.concert_location,
        cd.concert_datetime,
        cap.concert_area,
        csi.seat_row,
        csi.seat_column,
        cap.ticket_price
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
    console.log("已取得購物車狀態!");

    return result;
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const removeItemFromCart = async (deleteSeatId, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      `
            SELECT 
              csi.concert_area_price_id,
              csi.status AS seat_status, 
              csi.user_id , 
              sc.id AS shopping_cart_id, 
              sc.status AS status_in_cart
            FROM concert_seat_info csi
            INNER JOIN shopping_cart sc
              ON csi.id = sc.concert_seat_id 
            WHERE csi.id = ? FOR UPDATE;
            `,
      [deleteSeatId]
    );

    console.log(result);

    if (result.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "This seat never in the cart!" };
    }

    let removeFromCartInfo = [];
    for (let i = 0; i < result.length; i++) {
      if (
        result[i].seat_status === "cart" &&
        result[i].status_in_cart === "add-to-cart"
      ) {
        removeFromCartInfo.push(result[i]);
      }
    }

    if (removeFromCartInfo.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "This seat CANNOT be remove from the cart!" };
    }

    // 確認"想移除此座位者"與"預訂者"為同一人
    if (removeFromCartInfo[0].user_id !== userId) {
      await conn.query("ROLLBACK");
      return { error: "You have no right to remove the seat from the cart!" };
    }

    // 將 concert_seat_info table 中, 該座位的 status 更改為 'not-selected'
    await conn.query(
      "UPDATE concert_seat_info SET status ='not-selected', user_id = NULL , user_updated_status_datetime = NULL where id = ?",
      [deleteSeatId]
    );

    // 將 shopping_cart table 中, 根據 shopping cart id 找到所對應到的座位，並將 shopping cart table 的 status 更改為 'remove-from-cart'
    await conn.query(
      "UPDATE shopping_cart SET status ='remove-from-cart' where  id = ? ",
      [removeFromCartInfo[0].shopping_cart_id]
    );

    console.log("Seat already remove from the cart!");

    await conn.query("COMMIT");

    return {
      concert_area_price_id: removeFromCartInfo[0].concert_area_price_id,
      remove_from_cart_seat_id: deleteSeatId,
    };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const checkout = async (data, user) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let queryStr = `
          SELECT 
            csi.concert_area_price_id,
            csi.id AS concert_seat_id,
            csi.user_id,
            csi.status AS concert_seat_status,
            sc.status AS shopping_cart_status
          FROM concert_seat_info csi
          INNER JOIN shopping_cart sc
            ON csi.id = sc.concert_seat_id
          WHERE sc.id IN (?) 
          ORDER BY sc.id FOR UPDATE
        `;
    let bindings = [data.order.shoppingCartSeat];
    const [check] = await pool.query(queryStr, bindings);

    console.log(`check:${check}`);
    if (check.length === 0) {
      await conn.query("ROLLBACK");
      return { error: "Can't find the seat you ordered in the shopping Cart!" };
    }

    // 1. 確認你撈出來的 userId 與前台傳過來的 user.id 是同一個
    // 2. 再加上 concert_seat_status = "cart" 與 shopping_cart_status = "add_to_cart"
    let orderSeatId = [];
    let concertAreaPriceIds = [];
    for (let i = 0; i < check.length; i++) {
      if (
        check[i].user_id === user.id &&
        check[i].concert_seat_status === "cart" &&
        check[i].shopping_cart_status === "add-to-cart"
      ) {
        orderSeatId.push(check[i].concert_seat_id);
        concertAreaPriceIds.push(check[i].concert_area_price_id);
      }
    }

    if (orderSeatId.length !== check.length) {
      await conn.query("ROLLBACK");
      return { error: "You have no right to order these seats!" };
    }

    // 3.確認總金額是對的 (利用 concert_seat_id => concert_area_price_id => ticket_price)
    queryStr = `
          SELECT
            sum(ticket_price) AS subtotal
          FROM concert_area_price cap
          INNER JOIN concert_seat_info csi
            ON cap.id = csi.concert_area_price_id
          WHERE csi.id IN (?);
        `;

    bindings = [orderSeatId];

    const [subtotal] = await pool.query(queryStr, bindings);
    if (parseInt(subtotal[0].subtotal) !== data.order.subtotal) {
      await conn.query("ROLLBACK");
      return { error: "The subtotal price was wrong!" };
    }

    // 4.信用卡付款
    let paymentResult;
    try {
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
    } catch (error) {
      await conn.query("ROLLBACK");
      return { error };
    }

    // 5. 更改座位狀態 & 購物車座位的狀態
    // 將 concert_seat_info table 中, 該座位的 status 更改為 'sold'
    await conn.query(
      "UPDATE concert_seat_info SET status ='sold' where id IN (?)",
      [orderSeatId]
    );

    // 將 shopping_cart table 中, 根據 shopping cart id 找到所對應到的座位，並將 shopping cart table 的 status 更改為 'remove-to-order'
    await conn.query(
      "UPDATE shopping_cart SET status ='remove-to-order' where  id IN (?) ",
      [data.order.shoppingCartSeat]
    );

    // 6.成立訂單
    // (1) Insert into main_order
    const now = new Date();
    const mainOrderCode =
      "" +
      now.getMonth() +
      now.getDate() +
      (now.getTime() % (24 * 60 * 60 * 1000)) +
      Math.floor(Math.random() * 10); // 取得訂單編號
    const mainOrderRecord = {
      user_id: user.id,
      main_order_code: mainOrderCode,
      order_status: "待出貨",
      payment_status: "paid",
      payment: data.order.payment,
      shipping: data.order.shipping,
      subtotal: data.order.subtotal,
      freight: data.order.freight,
      total: data.order.total,
      details: validator.blacklist(JSON.stringify(data.order.recipient), "<>"),
    };

    const [result] = await pool.query(
      "INSERT INTO main_order SET ?",
      mainOrderRecord
    );
    const mainOrderId = result.insertId;

    // (2) Insert into sub_order
    let subOrderRecord = [];
    for (let i = 0; i < data.order.shoppingCartSeat.length; i++) {
      subOrderRecord.push([mainOrderId, data.order.shoppingCartSeat[i]]);
    }
    await conn.query(
      "INSERT INTO sub_order (main_order_id, shopping_cart_id) VALUES ?",
      [subOrderRecord]
    );

    // (3) Insert into payment
    const {
      amount,
      transaction_time_millis,
      rec_trade_id,
      bank_transaction_id,
      acquirer,
      currency,
      card_info,
      bank_transaction_time,
      bank_result_code,
      bank_result_msg,
      card_identifier,
      transaction_method_details,
    } = paymentResult;

    const other_data = {
      acquirer,
      currency,
      card_info,
      bank_transaction_time,
      bank_result_code,
      bank_result_msg,
      card_identifier,
      transaction_method_details,
    };

    bindings = {
      main_order_id: mainOrderId,
      payment: data.order.payment,
      amount,
      name: user.name,
      email: user.email,
      address: null,
      phone: user.phone,
      transaction_time_millis,
      rec_trade_id,
      bank_transaction_id,
      other_data: JSON.stringify(other_data),
    };

    await conn.query("INSERT INTO payment SET ?", bindings);

    await conn.query("COMMIT");
    return {
      mainOrderCode,
      concertAreaPriceIds,
      orderSeatId,
      ordererName: user.name,
      ordererEmail: user.email,
      orderTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      order_status: "待出貨",
      payment_status: "paid",
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
            ci.concert_title,
            ci.concert_location,
            cd.concert_datetime,
            cap.concert_area,
            csi.seat_row,
            csi.seat_column,
            cap.ticket_price
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
      return { error: "You have no right to check this order!" };
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
        mo.main_order_code,
        mo.order_status,
        mo.created_at,
        JSON_ARRAYAGG(
        JSON_OBJECT(
          "concert_title", ci.concert_title,
          "concert_location", ci.concert_location,
          "concert_datetime", cd.concert_datetime,
          "shoppingCartId", sc.id,
          "concertSeatId", csi.id,
          "concert_area", cap.concert_area,
          "row", csi.seat_row,
          "column", csi.seat_column,
          "ticket_price",cap.ticket_price
        )) AS ticket_info
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

module.exports = {
  getConcertTitleAndAreaImage,
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
};
