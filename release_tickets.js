const Order = require("./server/models/order_model");
const got = require("got");

const getfilterReleasedTickets = async () => {
  let result = await Order.filterReleasedTickets();
  let filterReleasedTickets = [];
  for (let i = 0; i < result.length; i++) {
    filterReleasedTickets.push(result[i].concertSeatId);
  }
  return filterReleasedTickets;
};

const releaseTickets = async () => {
  const tickets = await getfilterReleasedTickets();
  if (tickets.length === 0) {
    return "沒有需清除的票";
  }
  const result = await Order.releaseTickets(tickets);
  if (result.error) {
    console.log(result.error);
    return;
  }

  let socketReleasedTickets = {};

  for (let i = 0; i < result.concertSeatIds.length; i++) {
    const concertAreaPriceId = result.concertAreaPriceIds[i];
    const concertSeatId = result.concertSeatIds[i];
    if (!(concertAreaPriceId in socketReleasedTickets)) {
      socketReleasedTickets[concertAreaPriceId] = {
        concertAreaPriceId,
        concertSeatIds: [],
      };
    }
    socketReleasedTickets[concertAreaPriceId].concertSeatIds.push(
      concertSeatId
    );
  }
  return Object.values(socketReleasedTickets);
};

const init = async () => {
  const msg = await releaseTickets();
  await got.post("http://127.0.0.1:3000/api/1.0/order/releaseTickets", {
    headers: {
      "Content-Type": "application/json",
    },
    json: msg,
    responseType: "json",
  });
  return;
};

init();
