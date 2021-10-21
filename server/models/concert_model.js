const { pool } = require("./mysql");

const insertConcertInfo = async (concert_info) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "INSERT INTO concert_info SET ?",
      concert_info
    );
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

const insertConcertDateArea = async (concert_date_area) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "INSERT INTO concert_date_area SET ?",
      concert_date_area
    );
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

const insertSeatInfo = async (seat_info) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    await conn.query(
      "INSERT INTO seat_info(concert_date_area_id, concert_area_seat_row, concert_area_seat_column, area_seat_qty, status) VALUES ?",
      [seat_info]
    );
    await conn.query("COMMIT");
    return "finish!";
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const getCampaigns = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [result] = await conn.query(
      `
      Select 
        id, concert_title, sold_start, sold_end, concert_main_image, JSON_ARRAYAGG(concert_datetime) AS concert_datetime
      From 
      (select 
        ci.id, ci.concert_title, ci.sold_start, ci.sold_end, ci.concert_main_image, cda.concert_datetime
      From 
        concert_info AS ci
      JOIN
        concert_date_area AS cda
      on ci.id = cda.concert_id
      group by 1,2,3,4,5,6
      order by cda.concert_datetime) As t
      group by 1,2,3,4,5;
      `
    );
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return error;
  } finally {
    await conn.release();
  }
};

const getKeyvisuals = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [result] = await conn.query(
      ` 
      Select id AS concert_id, concert_main_image From concert_info;
      `
    );
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return error;
  } finally {
    await conn.release();
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

const getCampaignInfo = async (concert_id) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [result] = await conn.query(
      `
      WITH ConcertDateArea AS (
        SELECT
          concert_id, 
          json_object('concert_datetime', DATE_FORMAT(concert_datetime, '%Y-%m-%d %T'), 'ticket_prices', JSON_ARRAYAGG(ticket_price)) AS info
        FROM(
          SELECT DISTINCT 
            concert_id, 
            concert_datetime,
            ticket_price
          FROM concert_date_area
        ) t
        GROUP BY concert_id, concert_datetime
      )
      select 
        ci.concert_title, 
        ci.concert_story, 
        DATE_FORMAT(ci.sold_start, '%Y-%m-%d %T') AS sold_start,
          DATE_FORMAT(ci.sold_end, '%Y-%m-%d %T') AS sold_end, 
        ci.concert_location, 
        ci.concert_main_image,
        ci.concert_area_image,
        ci.notice,
        JSON_ARRAYAGG(cda.info) AS concert_info
      From concert_info AS ci
      JOIN ConcertDateArea AS cda
        on ci.id = cda.concert_id
      WHERE ci.id = ${concert_id}
      group by 1, 2, 3, 4, 5, 6, 7, 8;
      `
    );
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return error;
  } finally {
    await conn.release();
  }
};

module.exports = {
  insertConcertInfo,
  insertConcertDateArea,
  insertSeatInfo,
  getCampaigns,
  getKeyvisuals,
  getCampaignCount,
  getCampaignInfo,
};
