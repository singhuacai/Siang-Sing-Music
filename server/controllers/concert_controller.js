const Concert = require("../models/concert_model");
const offsetHours = process.env.TIMEZONE_OFFSET || 8;
const { adjustTimeZone } = require("../../util/util");

const createConcert = async (req, res) => {
  const data = req.body.data[0];

  const concertInfo = {
    concert_title: data.concertTitle,
    concert_story: data.concertStory,
    sold_start: adjustTimeZone(data.soldStart, -1 * offsetHours),
    sold_end: adjustTimeZone(data.soldEnd, -1 * offsetHours),
    concert_location: data.concertLocation,
    concert_main_image: data.concertMainImage,
    concert_area_image: data.concertAreaImage,
    notice: data.notice,
  };

  const concertId = await Concert.insertConcertInfo(concertInfo);
  if (concertId === -1) {
    return res.status(500);
  }

  data.dateAndSeatInfo.forEach(async (element) => {
    const dateAndSeatInfo = element;
    const concertDate = {
      concert_id: concertId,
      concert_datetime: adjustTimeZone(
        dateAndSeatInfo.concert_datetime,
        -1 * offsetHours
      ),
    };
    const concertDateId = await Concert.insertConcertDate(concertDate);
    if (concertDateId === -1) {
      return res.status(500);
    }
    dateAndSeatInfo.skuInfo.forEach(async (element) => {
      const skuInfo = element;
      const concertAreaPrice = {
        concert_date_id: concertDateId,
        concert_area: skuInfo.areaCode,
        ticket_price: skuInfo.ticketPrice,
      };
      const concertAreaPriceId = await Concert.insertConcertAreaPrice(
        concertAreaPrice
      );
      if (concertAreaPriceId === -1) {
        return res.status(500);
      }

      let concertSeatInfo = [];
      for (let row = 1; row < skuInfo.seatAllocation.length + 1; row++) {
        for (let col = 1; col < skuInfo.seatAllocation[row - 1] + 1; col++) {
          const seat = [concertAreaPriceId, row, col, "not-selected"];
          concertSeatInfo.push(seat);
        }
      }
      const result = await Concert.insertConcertSeatInfo(concertSeatInfo);
      if (result === -1) {
        return res.status(500);
      }
    });
  });
  res.status(200).send({ concertId });
};

const getCampaigns = async (req, res) => {
  let result = await Concert.getCampaigns();
  if (result.error || !result) {
    res.status(500);
    return;
  }
  const data = result.map((e) => {
    e.concertMainImage = `/${e.id}/${e.concertMainImage}`;
    return e;
  });

  res.status(200).send({ data });
};

const getKeyvisuals = async (req, res) => {
  let result = await Concert.getKeyvisuals();
  if (result.error || !result) {
    res.status(500);
    return;
  }

  const data = result.map((e) => {
    e.concertMainImage = `/${e.concertId}/${e.concertMainImage}`;
    return e;
  });

  res.status(200).send({ data });
};

const getConcertDetails = async (req, res) => {
  const concertId = parseInt(req.query.id);
  if (!concertId || req.query.id.trim() === "") {
    res.status(400).send({ error: "Bad request!" });
    return;
  }
  const concertCount = await Concert.getCampaignCount(concertId);

  if (concertCount[0].count === 0) {
    res.status(400).send({ error: "查無此場演唱會" });
    return;
  }

  const result = await Concert.getConcertDetails(concertId);
  if (result.error || !result) {
    res.status(500);
    return;
  }

  const [data] = result.map((e) => {
    e.soldStart = adjustTimeZone(e.soldStart, offsetHours);
    e.soldEnd = adjustTimeZone(e.soldEnd, offsetHours);
    e.concertMainImage = `/${e.concertId}/${e.concertMainImage}`;
    e.concertAreaImage = `/${e.concertId}/${e.concertAreaImage}`;
    e.concertInfo.map((s) => {
      s.concertDatetime = adjustTimeZone(s.concertDatetime, offsetHours);
      return s;
    });
    return e;
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
    res.status(500);
    return;
  }

  if (result.length === 0) {
    res.status(403).send({ error: "查無此關鍵字的相關演出!" });
    return;
  }

  const data = result.map((e) => {
    e.concertMainImage = `/${e.id}/${e.concertMainImage}`;
    return e;
  });

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
