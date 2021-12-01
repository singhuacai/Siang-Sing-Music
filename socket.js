const sio = require("socket.io");
const events = require("events");
const jwt = require("jsonwebtoken");
const User = require("./server/models/user_model");
const { TOKEN_SECRET } = process.env;
const em = new events.EventEmitter();

const SOCKET_EVENTS = {
  SEAT_SELECT: "NotifySeatSelect",
  SEAT_DELETE: "NotifySeatDelete",
  ROLLBACK_SEATS: "NotifyRollbackSeats",
  ADD_TO_CART: "NotifyAddToCart",
  REMOVE_FROM_CART: "NotifyRemoveFromCart",
  REMOVE_TO_ORDER: "NotifyRemoveToOrder",
  RELEASE_TICKETS: "NotifyReleaseTickets",
  CLIENT_SID: "ClientSocketId",
};

const BOARDCAST = {
  ALL_USERS: 1,
  ALL_USERS_IN_ROOM: 2,
  OTHER_USERS: 3,
  MYSELF: 4,
};
let io = null;

const getEventName = (socketId) => {
  return `EVENT_${socketId}`;
};

const getRoomName = (Id) => {
  return `room_area_${Id}`;
};

const socketConnect = (server) => {
  io = sio(server);
  // 確認身份
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const concertAreaPriceId = socket.handshake.query.concertAreaPriceId;

    if (!token) return next(new Error("Authentication error"));

    jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
      //認證失敗
      if (err) {
        return next(new Error("Authentication error"));
      }
      //認證成功
      let userDetail;
      userDetail = await User.getUserDetail(decoded.email);
      if (!userDetail) {
        const err = new Error("not authorized");
        err.data = { content: "Please retry later" };
        return next(err);
      }
      decoded.userId = userDetail.id;
      decoded.concertAreaPriceId = concertAreaPriceId;
      socket.decoded = decoded; // 把解出來的資訊做利用
      next();
    });
  }).on("connection", (socket) => {
    const room = getRoomName(socket.decoded.concertAreaPriceId);
    socket.join(room);

    const listener = (event, msg, target) => socket_send(socket, event, msg, target);

    const eventName = getEventName(socket.id);

    em.on(eventName, listener);

    socket_send(socket, SOCKET_EVENTS.CLIENT_SID, socket.id, BOARDCAST.MYSELF);

    socket.on("disconnect", () => {
      console.log(`user ${socket.id} disconnected`);
    });
  });
};

const notifySeatSelected = (socketId, msg, target) => {
  const eventName = getEventName(socketId);
  em.emit(eventName, SOCKET_EVENTS.SEAT_SELECT, msg, target);
};

const notifySeatDeleted = (socketId, msg, target) => {
  const eventName = getEventName(socketId);
  em.emit(eventName, SOCKET_EVENTS.SEAT_DELETE, msg, target);
};

const notifyRollbackSeats = (socketId, msg, target) => {
  const eventName = getEventName(socketId);
  em.emit(eventName, SOCKET_EVENTS.ROLLBACK_SEATS, msg, target);
};

const notifyAddToCart = (socketId, msg, target) => {
  const eventName = getEventName(socketId);
  em.emit(eventName, SOCKET_EVENTS.ADD_TO_CART, msg, target);
};

const notifyRemoveFromCart = (msg) => {
  msg = JSON.parse(msg);
  const room = getRoomName(msg.concertAreaPriceId);
  io.to(room).emit(SOCKET_EVENTS.REMOVE_FROM_CART, msg);
};

const notifyRemoveToOrder = (msg) => {
  msg = JSON.parse(msg);
  for (let i = 0; i < msg.concertAreaPriceIds.length; i++) {
    const room = getRoomName(msg.concertAreaPriceIds[i]);
    const new_msg = JSON.stringify({
      owner: msg.owner,
      removeToOrderSeat: msg.removeToOrderSeat[i],
    });
    io.to(room).emit(SOCKET_EVENTS.REMOVE_TO_ORDER, new_msg);
  }
};

const notifyReleaseTickets = (msg) => {
  for (let i = 0; i < msg.length; i++) {
    const room = getRoomName(msg[i].concertAreaPriceId);
    const new_msg = msg[i].concertSeatIds;
    io.to(room).emit(SOCKET_EVENTS.RELEASE_TICKETS, new_msg);
  }
};

const socket_send = (socket, event, msg, target) => {
  switch (target) {
    case BOARDCAST.ALL_USERS:
      io.sockets.emit(event, msg);
      break;
    case BOARDCAST.ALL_USERS_IN_ROOM:
      const room = getRoomName(socket.decoded.concertAreaPriceId);
      io.to(room).emit(event, msg);
      break;
    case BOARDCAST.OTHER_USERS:
      socket.broadcast.emit(event, msg);
      break;
    case BOARDCAST.MYSELF:
      socket.emit(event, msg);
      break;
    default:
  }
};

module.exports = {
  BOARDCAST,
  socketConnect,
  notifySeatSelected,
  notifySeatDeleted,
  notifyRollbackSeats,
  notifyAddToCart,
  notifyRemoveFromCart,
  notifyRemoveToOrder,
  notifyReleaseTickets,
};
