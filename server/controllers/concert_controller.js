const Concert = require("../models/concert_model");

const createConcert = async (req, res) => {
  const data = req.body.data[0];

  const concert_info = {
    concert_title: data.concert_title,
    concert_story: data.concert_story,
    sold_start: data.sold_start,
    sold_end: data.sold_end,
    concert_location: data.concert_location,
    concert_main_image: data.concert_main_image,
    concert_area_image: data.concert_area_image,
    notice: data.notice,
  };

  const concertId = await Concert.insertConcertInfo(concert_info);
  for (let i = 0; i < data.concert_info.length; i++) {
    for (let area = 0; area < data.concert_info[i].sku_info.length; area++) {
      const concert_date_area = {
        concert_id: concertId,
        concert_datetime: data.concert_info[i].concert_datetime,
        concert_area: data.concert_info[i].sku_info[area].area_code,
        ticket_price: data.concert_info[i].sku_info[area].ticket_price,
      };

      const concertDateAreaId = await Concert.insertConcertDateArea(
        concert_date_area
      );
      console.log(concertDateAreaId);

      let seat_info = [];
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
            concertDateAreaId,
            row + 1, // concert_area_seat_row
            col + 1, // concert_area_seat_column
            1, // area_seat_qty
            "not-selected", // status
          ];
          seat_info.push(seat);
        }
      }
      await Concert.insertSeatInfo(seat_info);
    }
  }

  if (concertId === -1) {
    res.status(500).send("Insert Error!");
  } else {
    res.status(200).send({ concertId });
  }
};

const getCampaigns = async (req, res) => {
  let result = await Concert.getCampaigns();
  const data = result.map((v) => {
    v.concert_main_image = `/${v.id}/${v.concert_main_image}`;
    return v;
  });
  res.send({ data });
};

const getKeyvisuals = async (req, res) => {
  let result = await Concert.getKeyvisuals();

  const data = result.map((v) => {
    v.concert_main_image = `/${v.concert_id}/${v.concert_main_image}`;
    return v;
  });
  res.send({ data });
};

const getCampaignInfo = async (req, res) => {
  const concert_id = parseInt(req.query.id);
  if (!concert_id || req.query.id.trim() === "") {
    res.status(400).send({ error: "Bad request!" });
    return;
  }
  const concertCount = await Concert.getCampaignCount(concert_id);

  if (concertCount[0].count === 0) {
    res.status(400).send({ error: "Concert id is not exist!" });
    return;
  }

  let result = await Concert.getCampaignInfo(concert_id);

  const [data] = result.map((v) => {
    v.concert_main_image = `/${concert_id}/${v.concert_main_image}`;
    v.concert_area_image = `/${concert_id}/${v.concert_area_image}`;
    return v;
  });
  res.status(200).send({ data });
};

module.exports = {
  createConcert,
  getCampaigns,
  getKeyvisuals,
  getCampaignInfo,
};
