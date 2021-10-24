const { pool } = require("./mysql");

const checkConcert = async (concertDateId) => {
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

const getAreasAndTicketPrices = async (concert_date_id) => {
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
  const bindings = [concert_date_id];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

module.exports = {
  getConcertTitleAndAreaImage,
  checkConcert,
  getAreasAndTicketPrices,
};
