const Order = require("../models/order_model");

const getPerformanceAndAreas = async (req, res) => {
  console.log(req.body);
  const { concert_id, concert_date_id } = req.body;

  // 給定 concert_id => 搜尋 concert_title
  let [result] = await Order.getConcertTitle(concert_id);
  const concertTitle = result.concert_title;

  // 給定 concert_id 及 concert_datetime => 查詢 Area 與 ticket prices

  areaAndTicketPrices = await Order.getAreasAndTicketPrices(concert_date_id);
  res.status(200).send({
    concert_title: concertTitle,
    area_and_ticket_prices: areaAndTicketPrices,
  });
};
module.exports = {
  getPerformanceAndAreas,
};
