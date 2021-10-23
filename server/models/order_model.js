const { pool } = require("./mysql");

const getConcertTitle = async (concert_id) => {
  const queryStr = `
  select concert_title FROM concert_info WHERE id = ?;
    `;
  const bindings = [concert_id];
  const [concert_title] = await pool.query(queryStr, bindings);
  return concert_title;
};

const getAreasAndTicketPrices = async (concert_date_id) => {
  const queryStr = `
  SELECT
	  cap.concert_area, cap.ticket_price, sum(csi.area_seat_qty) AS total_seats
  FROM
    concert_area_price cap
  INNER JOIN
    concert_seat_info csi
  ON cap.id = csi.concert_area_price_id
  WHERE cap.concert_date_id = ?
  GROUP BY cap.concert_area, cap.ticket_price;
    `;
  const bindings = [concert_date_id];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

module.exports = {
  getConcertTitle,
  getAreasAndTicketPrices,
};
