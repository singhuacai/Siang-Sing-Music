const sio = require("socket.io");
const events = require("events");
const jwt = require("jsonwebtoken");
const User = require("./server/models/user_model");
const { TOKEN_SECRET } = process.env;
const em = new events.EventEmitter();

const SOCKET_EVENTS = {
    SEAT_SELECT: "NotifySeatSelect",
    SEAT_DELETE: "NotifySeatDelete",
    ROLLBACK_SEAT: "NotifyRollbackSeat",
    ADD_TO_CART: "NotifyAddToCart",
    REMOVE_FROM_CART: "NotifyRemoveFromCart",
    REMOVE_TO_ORDER: "NotifyRemoveToOrder",
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
        console.log(`concertAreaPriceId:${concertAreaPriceId}`);

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
            console.log(`decoded(AFTER)${decoded.userId}`);
            socket.decoded = decoded; // 把解出來資訊做利用
            console.log(socket.decoded);
            next();
        });
    }).on("connection", (socket) => {
        const room = getRoomName(socket.decoded.concertAreaPriceId);
        console.log(socket.rooms);
        socket.join(room);
        console.log(socket.rooms);
        console.log(`a user ${socket.id} connected, Join Room : ${room}`);
        console.log(socket.decoded);

        const listener = (event, msg, target) => socket_send(socket, event, msg, target);

        const eventName = getEventName(socket.id);

        em.on(eventName, listener);

        socket_send(socket, SOCKET_EVENTS.CLIENT_SID, socket.id, BOARDCAST.MYSELF);

        socket.on("disconnect", () => {
            console.log(`user ${socket.id} disconnected`);
            // em.off(eventName, listener);
        });
    });
};

const notifySeatSelected = (socketId, msg, target) => {
    console.log(`notifySeatSelected_msg=======================`);
    console.log(typeof msg);
    console.log(msg);
    const eventName = getEventName(socketId);
    console.log(`eventName(choose):==================================${eventName}`);
    em.emit(eventName, SOCKET_EVENTS.SEAT_SELECT, msg, target);
};

const notifySeatDeleted = (socketId, msg, target) => {
    console.log(`notifySeatDeleted_msg=======================`);
    console.log(msg);
    const eventName = getEventName(socketId);
    console.log(`eventName(delete):==================================${eventName}`);
    em.emit(eventName, SOCKET_EVENTS.SEAT_DELETE, msg, target);
};

const notifyRollbackSeat = (socketId, msg, target) => {
    console.log(`notifyRollbackSeat_msg=======================`);
    console.log(msg);
    const eventName = getEventName(socketId);
    console.log(`eventName(rollback):==================================${eventName}`);
    em.emit(eventName, SOCKET_EVENTS.ROLLBACK_SEAT, msg, target);
};

const notifyAddToCart = (socketId, msg, target) => {
    console.log(`notifyAddToCart_msg=======================`);
    console.log(msg);
    const eventName = getEventName(socketId);
    console.log(`eventName(addtocart):==================================${eventName}`);
    em.emit(eventName, SOCKET_EVENTS.ADD_TO_CART, msg, target);
};

const notifyRemoveFromCart = (msg) => {
    msg = JSON.parse(msg);
    console.log(`concertAreaPriceId:${msg.concert_area_price_id}`);
    const room = getRoomName(msg.concert_area_price_id);
    io.to(room).emit(SOCKET_EVENTS.REMOVE_FROM_CART, msg);
};

const notifyRemoveToOrder = (msg) => {
    msg = JSON.parse(msg);
    console.log(`concertAreaPriceIds:${msg.concertAreaPriceIds}`);
    console.log(`removeToOrderSeat:${msg.removeToOrderSeat}`);
    for (let i = 0; i < msg.concertAreaPriceIds.length; i++) {
        const room = getRoomName(msg.concertAreaPriceIds[i]);
        const new_msg = JSON.stringify({
            owner: msg.owner,
            removeToOrderSeat: msg.removeToOrderSeat[i],
        });
        io.to(room).emit(SOCKET_EVENTS.REMOVE_TO_ORDER, new_msg);
    }
};

const socket_send = (socket, event, msg, target) => {
    switch (target) {
        case BOARDCAST.ALL_USERS:
            console.log(`(ALL)socket.id:${socket.id}`);
            console.log(`userid:${socket.decoded.userId}`);
            io.sockets.emit(event, msg);
            break;
        case BOARDCAST.ALL_USERS_IN_ROOM:
            const room = getRoomName(socket.decoded.concertAreaPriceId);
            console.log(`(ALL_USERS_IN_ROOM)socket.id:${socket.id}, Room: ${room}`);
            io.to(room).emit(event, msg);
            break;
        case BOARDCAST.OTHER_USERS:
            console.log(`(OTHER_USER)socket.id:${socket.id}`);
            console.log(`userid:${socket.decoded.userId}`);
            socket.broadcast.emit(event, msg);
            break;
        case BOARDCAST.MYSELF:
            console.log(`(MYSELF)socket.id:${socket.id}`);
            console.log(`userid:${socket.decoded.userId}`);
            console.log(`msg:${msg}`);
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
    notifyRollbackSeat,
    notifyAddToCart,
    notifyRemoveFromCart,
    notifyRemoveToOrder,
};
