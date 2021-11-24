const Concert = require("../models/concert_model");
const moment = require("moment");
const offsetHours = process.env.TIMEZONE_OFFSET || 8;

const createConcert = async (req, res) => {
  const data = req.body.data[0];

  const concertInfo = {
    concert_title: data.concert_title,
    concert_story: data.concert_story,
    sold_start: moment(data.sold_start)
      .subtract(offsetHours, "hours")
      .format("YYYY-MM-DD HH:mm:ss"),
    sold_end: moment(data.sold_end)
      .subtract(offsetHours, "hours")
      .format("YYYY-MM-DD HH:mm:ss"),
    concert_location: data.concert_location,
    concert_main_image: data.concert_main_image,
    concert_area_image: data.concert_area_image,
    notice: data.notice,
  };

  const concertId = await Concert.insertConcertInfo(concertInfo);
  if (concertId === -1) {
    return res.status(500);
  }
  for (let i = 0; i < data.concert_info.length; i++) {
    const concertDate = {
      concert_id: concertId,
      concert_datetime: moment(data.concert_info[i].concert_datetime)
        .subtract(offsetHours, "hours")
        .format("YYYY-MM-DD HH:mm:ss"),
    };

    const concertDateId = await Concert.insertConcertDate(concertDate);
    if (concertDateId === -1) {
      return res.status(500);
    }

    for (let area = 0; area < data.concert_info[i].sku_info.length; area++) {
      const concertAreaPrice = {
        concert_date_id: concertDateId,
        concert_area: data.concert_info[i].sku_info[area].area_code,
        ticket_price: data.concert_info[i].sku_info[area].ticket_price,
      };
      const concertAreaPriceId = await Concert.insertConcertAreaPrice(
        concertAreaPrice
      );
      if (concertAreaPriceId === -1) {
        return res.status(500);
      }

      let concertSeatInfo = [];
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
            concertAreaPriceId,
            row + 1, // seat_row
            col + 1, // seat_column
            "not-selected", // status
          ];
          concertSeatInfo.push(seat);
        }
      }
      await Concert.insertConcertSeatInfo(concertSeatInfo);
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
  if (result.error || !result) {
    res.status(500).send({ error: "server error" });
    return;
  }
  const data = result.map((v) => {
    v.concert_main_image = `/${v.id}/${v.concert_main_image}`;
    return v;
  });
  res.status(200).send({ data });
};

const getKeyvisuals = async (req, res) => {
  let result = await Concert.getKeyvisuals();
  if (result.error || !result) {
    res.status(500).send({ error: "server error" });
    return;
  }

  const data = result.map((v) => {
    v.concert_main_image = `/${v.concert_id}/${v.concert_main_image}`;
    return v;
  });
  res.send({ data });
};

const getConcertDetails = async (req, res) => {
  const concert_id = parseInt(req.query.id);
  if (!concert_id || req.query.id.trim() === "") {
    res.status(400).send({ error: "Bad request!" });
    return;
  }
  const concertCount = await Concert.getCampaignCount(concert_id);

  if (concertCount[0].count === 0) {
    res.status(400).send({ error: "查無此場演唱會" });
    return;
  }

  let result = await Concert.getConcertDetails(concert_id);
  if (result.error || !result) {
    res.status(500).send({ error: "server error" });
    return;
  }

  const [data] = result.map((v) => {
    v.sold_start = moment(v.sold_start)
      .add(offsetHours, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    v.sold_end = moment(v.sold_end)
      .add(offsetHours, "hours")
      .format("YYYY-MM-DD HH:mm:ss");
    v.concert_main_image = `/${concert_id}/${v.concert_main_image}`;
    v.concert_area_image = `/${concert_id}/${v.concert_area_image}`;
    v.concert_info.map((s) => {
      s.concert_datetime = moment(s.concert_datetime)
        .add(offsetHours, "hours")
        .format("YYYY-MM-DD HH:mm:ss");
      return s;
    });

    return v;
  });
  res.status(200).send({ data });
};

const getCampaignsByKeyword = async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    res.status(400).send({ error: "Bad request!" });
    return;
  }
  let result = await Concert.getCampaignsByKeyword(keyword);
  if (result.error || !result) {
    res.status(500).send({ error: "server error" });
    return;
  }
  const data = result.map((v) => {
    v.concert_main_image = `/${v.id}/${v.concert_main_image}`;
    return v;
  });

  if (data.length === 0) {
    res.status(403).send({ error: "查無此關鍵字的相關演出!" });
    return;
  }
  res.status(200).send({ data });
  return;
};

module.exports = {
  createConcert,
  getCampaigns,
  getKeyvisuals,
  getConcertDetails,
  getCampaignsByKeyword,
};
