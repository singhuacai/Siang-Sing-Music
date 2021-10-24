const { pool } = require("./mysql");

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
  return result;
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
    cap.id AS concert_area_price_id, cap.concert_area, cap.ticket_price, sum(csi.area_seat_qty) AS total_seats
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

const getSeatStatus = async (concertAreaPriceId) => {
  const queryStr = `
  select 
    id AS concert_seat_id,
    concert_area_seat_row,
    concert_area_seat_column,
    area_seat_qty,
    status
  FROM
    concert_seat_info
  where 
    concert_area_price_id = ?;
    `;
  const bindings = [concertAreaPriceId];
  const [result] = await pool.query(queryStr, bindings);
  return result;
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
      "SELECT status FROM concert_seat_info WHERE id = ? FOR UPDATE",
      [concertSeatId]
    );

    //========= use setTimout function to test the race condition (below) ==================
    /*
    function promiseFn(num, time = 5 * 1000) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          num ? resolve(`${num}, 成功`) : reject("失敗");
        }, time);
      });
    }
    //======================================================================================
    async function getData() {
      const data1 = await promiseFn(1); // 因為 await，promise 函式被中止直到回傳
      const data2 = await promiseFn(2);
      console.log(data1, data2); // 1, 成功 2, 成功
    }
    await getData();
    */
    //========= use setTimout function to test the race condition (above) ==================

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
      return { error: "You have selected 4 seats!" };
    }

    await conn.query(
      "UPDATE concert_seat_info SET status ='selected', user_id = ?, user_updated_status_datetime = CURRENT_TIMESTAMP() where id = ?",
      [userId, concertSeatId]
    );

    console.log("已將status更改為selected了!");
    await conn.query("COMMIT");
    return {
      result: `You have selected a seat with the seat code of ${concertSeatId}!`,
    };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = {
  getConcertTitleAndAreaImage,
  checkConcertByConcertDateId,
  checkConcertByConcertAreaPriceId,
  getAreasAndTicketPrices,
  getSeatStatus,
  getChosenConcertInfo,
  chooseSeat,
};
