const { pool } = require("./mysql");

const createConcert = async (concert, seats) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    // console.log(concert);
    const [result] = await conn.query("INSERT INTO concert SET ?", concert);
    // console.log(seats);
    await conn.query(
      "INSERT INTO seat(concert_id, concert_date, concert_time, concert_area, concert_area_seat_row, concert_area_seat_column, concert_area_seat, ticket_price, area_seat_qty, status) VALUES ?",
      [seats]
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
  createConcert,
};
