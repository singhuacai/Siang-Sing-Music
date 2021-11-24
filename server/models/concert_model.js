const { pool } = require("./mysql");

const executeTransaction = async (queryStr, bindings) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(queryStr, bindings);
    await conn.query("COMMIT");
    return result.insertId;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const insertConcertInfo = async (concertInfo) => {
  const queryStr = "INSERT INTO concert_info SET ?";
  const bindings = concertInfo;
  return await executeTransaction(queryStr, bindings);
};

const insertConcertDate = async (concertDate) => {
  const queryStr = "INSERT INTO concert_date SET ?";
  const bindings = concertDate;
  return await executeTransaction(queryStr, bindings);
};

const insertConcertAreaPrice = async (concertAreaPrice) => {
  const queryStr = "INSERT INTO concert_area_price SET ?";
  const bindings = concertAreaPrice;
  return await executeTransaction(queryStr, bindings);
};

const insertConcertSeatInfo = async (concertSeatInfo) => {
  const queryStr =
    "INSERT INTO concert_seat_info(concert_area_price_id, seat_row, seat_column, status) VALUES ?";
  const bindings = [concertSeatInfo];
  return await executeTransaction(queryStr, bindings);
};

const getCampaigns = async () => {
  try {
    const queryStr = `
    SELECT 
      ci.id, 
      ci.concert_title, 
      ci.concert_main_image, 
      JSON_ARRAYAGG(DATE_FORMAT(cd.concert_datetime, '%Y-%m-%d %T')) AS concert_datetime
    FROM 
      concert_info AS ci
    JOIN
      concert_date AS cd
    on ci.id = cd.concert_id
    WHERE CURRENT_TIMESTAMP() between DATE_SUB(ci.sold_start, INTERVAL 7 DAY) and ci.sold_end
    group by 1,2,3
    order by cd.concert_datetime
  `;

    const [result] = await pool.query(queryStr);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getKeyvisuals = async () => {
  try {
    const queryStr = `
    Select id AS concert_id, concert_main_image From concert_info;
    `;
    const [result] = await pool.query(queryStr);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getCampaignCount = async (concert_id) => {
  const queryStr = `
  SELECT count(*) as count FROM concert_info  WHERE id = ?;
  `;
  const bindings = [concert_id];
  const [count] = await pool.query(queryStr, bindings);
  return count;
};

const getConcertDetails = async (concert_id) => {
  try {
    const queryStr = `
    WITH 
    DistinctDatePriceRaw AS (
    SELECT DISTINCT
      cd.concert_id,
      cap.concert_date_id,
      DATE_FORMAT(cd.concert_datetime, '%Y-%m-%d %T') AS concert_datetime,
      cap.ticket_price
    FROM concert_date cd
    JOIN concert_area_price cap
    ON cd.id = cap.concert_date_id
    WHERE cd.concert_id =?
    ),
    DistinctDatePrice AS (
    SELECT
      concert_id,
      concert_date_id,
      concert_datetime,
      JSON_ARRAYAGG(ticket_price) AS ticket_prices
    FROM DistinctDatePriceRaw
    GROUP BY concert_id, concert_date_id, concert_datetime
    )
    SELECT
      ci.id AS concert_id,
      ci.concert_title,
      ci.concert_story,
      ci.sold_start,
      ci.sold_end,
      ci.concert_location,
      ci.concert_main_image,
      ci.concert_area_image,
      ci.notice,
      json_arrayagg(
        json_object(
        'concert_datetime', ddp.concert_datetime,
        'concert_date_id', ddp.concert_date_id,
        'ticket_prices', ddp.ticket_prices
        )
      ) AS concert_info
    from concert_info ci
    inner join  DistinctDatePrice ddp
    on ddp.concert_id = ci.id
    GROUP BY 1,2,3,4,5,6,7,8,9;
      `;
    const bindings = [concert_id];
    const [result] = await pool.query(queryStr, bindings);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const getCampaignsByKeyword = async (keyword) => {
  try {
    const queryStr = `
    SELECT 
      ci.id, 
      ci.concert_title, 
      ci.concert_main_image, 
      JSON_ARRAYAGG(DATE_FORMAT(cd.concert_datetime, '%Y-%m-%d %T')) AS concert_datetime
    FROM 
      concert_info AS ci
    JOIN
      concert_date AS cd
    on ci.id = cd.concert_id
    WHERE CURRENT_TIMESTAMP() between DATE_SUB(ci.sold_start, INTERVAL 7 DAY) and ci.sold_end and ci.concert_title LIKE ?
    group by 1,2,3
    order by cd.concert_datetime
  `;

    const bindings = [`%${keyword}%`];
    const [result] = await pool.query(queryStr, bindings);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = {
  executeTransaction,
  insertConcertInfo,
  insertConcertDate,
  insertConcertAreaPrice,
  insertConcertSeatInfo,
  getCampaigns,
  getKeyvisuals,
  getCampaignCount,
  getConcertDetails,
  getCampaignsByKeyword,
};
