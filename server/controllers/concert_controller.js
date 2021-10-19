const Concert = require("../models/concert_model");

const createConcert = async (req, res) => {
  const data = req.body.data[0];

  const now = new Date();
  const concert_id = parseInt(
    "" +
      now.getMonth() +
      now.getDate() +
      (now.getTime() % (24 * 60 * 60 * 1000)) +
      Math.floor(Math.random() * 10)
  ); // 取得演唱會活動的編號(string => int)

  const concert = {
    id: concert_id,
    concert_title: data.concert_title,
    concert_story: data.concert_story,
    sold_start: data.sold_start,
    sold_end: data.sold_end,
    concert_location: data.concert_location,
    concert_main_image: data.concert_main_image,
    concert_area_image: data.concert_area_image,
    notice: data.notice,
  };

  let seats = [];
  for (let i = 0; i < data.concert_info.length; i++) {
    for (let area = 0; area < data.concert_info[i].sku_info.length; area++) {
      for (
        let row = 0;
        row < data.concert_info[i].sku_info[area].seat_allocation.length;
        row++
      ) {
        for (
          let col = 0;
          col < data.concert_info[i].sku_info[area].seat_allocation[row];
          col++
        ) {
          const seat = [
            concert_id,
            data.concert_info[i].concert_date, // concert_date
            data.concert_info[i].concert_time, // concert_time
            data.concert_info[i].sku_info[area].area_code, // concert_area
            row + 1, // concert_area_seat_row
            col + 1, // concert_area_seat_column
            `${row + 1}-${col + 1}`, // concert_area_seat
            data.concert_info[i].sku_info[area].ticket_price, // ticket_price
            1, // area_seat_qty
            "not-selected", // status
          ];
          seats.push(seat);
        }
      }
    }
  }

  const result = await Concert.createConcert(concert, seats);
  if (result === -1) {
    res.status(500).send({ result });
  } else {
    res.status(200).send({ result });
  }
};

module.exports = {
  createConcert,
};
