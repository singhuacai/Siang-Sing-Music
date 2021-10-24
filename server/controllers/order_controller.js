const Order = require("../models/order_model");
const moment = require("moment");
const offset_hours = process.env.TIMEZONE_OFFSET || 8;

const getPerformanceAndAreas = async (req, res) => {
  const { concertId, concertDateId } = req.query;

  // 給定 concertDateId => 確認確實有此場演唱會
  let result = await Order.checkConcert(concertDateId);
  if (result[0].count === 0) {
    res.status(400).send({ error: "Error request!" });
    return;
  }

  // 給定 concertDateId => 搜尋 concert_info
  result = await Order.getConcertTitleAndAreaImage(concertDateId);

  if (!result[0]) {
    res.status(400).send({ error: "Error request!" });
    return;
  }
  result.map((v) => {
    v.concert_area_image = `/${concertId}/${v.concert_area_image}`;
    v.concert_datetime = moment(v.concert_datetime)
      .add(offset_hours, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    return v;
  });

  console.log(result);
  // 給定 concertDateId => 查詢 Area 與 ticket prices
  areaAndTicketPrices = await Order.getAreasAndTicketPrices(concertDateId);
  res.status(200).send({
    concert_title: result[0].concert_title,
    concert_location: result[0].concert_location,
    concert_area_image: result[0].concert_area_image,
    concert_datetime: result[0].concert_datetime,
    area_and_ticket_prices: areaAndTicketPrices,
  });
};
module.exports = {
  getPerformanceAndAreas,
};
