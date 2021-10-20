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

module.exports = {
  insertConcertInfo,
  insertConcertDateArea,
  insertSeatInfo,
};
