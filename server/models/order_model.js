const { pool } = require("./mysql");

const getConcertTitle = async (concert_id) => {
  const queryStr = `
  select concert_title FROM concert_info WHERE id = ?;
    `;
  const bindings = [concert_id];
  const [concert_title] = await pool.query(queryStr, bindings);
  return concert_title;
};

const getAreasAndTicketPrices = async (concert_id, concert_datetime) => {
  const queryStr = `
  select 
    cda.concert_area, cda.ticket_price, sum(si.area_seat_qty) AS total_seats
  FROM
    concert_date_area AS cda
  JOIN
    seat_info AS si
  on cda.id = si.concert_date_area_id
  where cda.concert_id =? AND cda.concert_datetime = ?
  group by 1,2;
    `;
  const bindings = [concert_id, concert_datetime];
  const [result] = await pool.query(queryStr, bindings);
  return result;
};

module.exports = {
  getConcertTitle,
  getAreasAndTicketPrices,
};
