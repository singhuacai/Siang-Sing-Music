urlParams = new URLSearchParams(window.location.search);
concertId = urlParams.get("concertId");
concertDateId = urlParams.get("concertDateId");
concertAreaPriceId = urlParams.get("concertAreaPriceId");
const Authorization = localStorage.getItem("Authorization");
const UserCode = localStorage.getItem("UserCode");
let chosenSeats = [];
let countOfCartAndSold = 0;

let isZero = false;

// restrict users from being able to return to this page through "previous page"
window.history.forward(1);

// detect whether the page is refreshed
const pageAccessedByReload =
  (window.performance.navigation && window.performance.navigation.type === 1) ||
  window.performance
    .getEntriesByType("navigation")
    .map((nav) => nav.type)
    .includes("reload");

$("#content-block").html(
  `
    <div id="concert-seats" class="content concert-seats">
        <table id="seats-table" class="table">
            <tbody id="seats-table-list"></tbody>
        </table>
    </div>
    <div class="content chair-style"></div>
    <div id="add-to-cart" class="content"></div>
    `
);

$("#order-flow-step").html(
  `<img
        id="order-flow-step-img"
        src="../images/order_flow/Step2.png"
        alt="step2-ChooseArea"
        title="step2-ChooseArea"
        width="600px"
    />`
);

// socket.io
let socketId = null;
var socket = io({
  query: { concertAreaPriceId },
  auth: (cb) => {
    cb({ token: localStorage.getItem("Authorization") });
  },
});

socket.on("ClientSocketId", (msg) => {
  socketId = msg;
});

socket.on("NotifySeatSelect", (msg) => {
  msg = JSON.parse(msg);
  const { owner, seatId } = msg;
  if (owner === localStorage.getItem("UserCode")) {
    $(`#${seatId}`).removeClass("not-selected").addClass("you-selected");
    $(`#${seatId}`).attr("src", "../images/logo/icon_chair_select.gif");
    addSeatIntoChosenSeatsArray(msg.seatId);
  } else {
    if ($(`#${seatId}`).hasClass("not-selected")) {
      $(`#${seatId}`).removeClass("not-selected").addClass("selected");
    } else if ($(`#${seatId}`).hasClass("you-selected")) {
      $(`#${seatId}`).removeClass("you-selected").addClass("selected");
    }
    $(`#${seatId}`).attr("src", "../images/logo/icon_chair_selected.gif");
  }
});

socket.on("NotifySeatDelete", (msg) => {
  msg = JSON.parse(msg);
  const { owner, seatId } = msg;
  if (owner === localStorage.getItem("UserCode")) {
    $(`#${seatId}`).removeClass("you-selected").addClass("not-selected");
    removeSeatFromChosenSeatsArray(seatId);
  } else {
    $(`#${seatId}`).removeClass("selected").addClass("not-selected");
  }
  $(`#${seatId}`).attr("src", "../images/logo/icon_chair_not_selected.gif");
});

socket.on("NotifyRollbackSeats", (msg) => {
  msg = JSON.parse(msg);
  for (let i = 0; i < msg.rollBackSeats.length; i++) {
    if (msg.owner === localStorage.getItem("UserCode")) {
      $(`#${msg.rollBackSeats[i]}`).removeClass("you-selected").addClass("not-selected");
    } else {
      $(`#${msg.rollBackSeats[i]}`).removeClass("selected").addClass("not-selected");
    }
    $(`#${msg.rollBackSeats[i]}`).attr("src", "../images/logo/icon_chair_not_selected.gif");
  }
});

socket.on("NotifyAddToCart", (msg) => {
  msg = JSON.parse(msg);
  for (let i = 0; i < msg.addToCartSeats.length; i++) {
    if (msg.owner === localStorage.getItem("UserCode")) {
      $(`#${msg.addToCartSeats[i]}`).removeClass("you-selected").addClass("you-cart");
      chosenSeats = [];
      countOfCartAndSold += msg.addToCartSeats.length;
      window.location.assign(`/index.html`);
    } else {
      $(`#${msg.addToCartSeats[i]}`).removeClass("selected").addClass("cart");
    }
    $(`#${msg.addToCartSeats[i]}`).attr("src", "../images/logo/icon_chair_cart.gif");
  }
});

socket.on("NotifyRemoveFromCart", (msg) => {
  if (msg.owner === localStorage.getItem("UserCode")) {
    $(`#${msg.removeFromCartSeat}`).removeClass("you-cart").addClass("not-selected");
    countOfCartAndSold -= 1;
  } else {
    $(`#${msg.removeFromCartSeat}`).removeClass("cart").addClass("not-selected");
  }
  $(`#${msg.removeFromCartSeat}`).attr("src", "../images/logo/icon_chair_not_selected.gif");
});

socket.on("NotifyRemoveToOrder", (msg) => {
  msg = JSON.parse(msg);
  if (msg.owner === localStorage.getItem("UserCode")) {
    $(`#${msg.removeToOrderSeat}`).removeClass("you-cart").addClass("you-sold");
  } else {
    $(`#${msg.removeToOrderSeat}`).removeClass("cart").addClass("sold");
  }
  $(`#${msg.removeToOrderSeat}`).attr("src", "../images/logo/icon_chair_sold.gif");
});

socket.on("NotifyReleaseTickets", (msg) => {
  for (let i = 0; i < msg.length; i++) {
    if ($(`#${msg[i]}`).hasClass("you-cart")) {
      $(`#${msg[i]}`).removeClass("you-cart").addClass("not-selected");
    } else if ($(`#${msg[i]}`).hasClass("cart")) {
      $(`#${msg[i]}`).removeClass("cart").addClass("not-selected");
    }
    $(`#${msg[i]}`).attr("src", "../images/logo/icon_chair_not_selected.gif");
  }
});

socket.on("connect_error", (err) => {
  console.log(err instanceof Error); // true
  console.log(err.message); // not authorized
  console.log(err.data);
});

$(document).ready(function () {
  $(document).bind("keydown", function (e) {
    e = window.event || e;
    // block users from pressing F5 to refresh the page
    if (e.keyCode == 116) {
      e.keyCode = 0;
      return false;
    }
  });
});

window.onbeforeunload = function () {
  (async function () {
    try {
      await rollBackChoose();
    } catch (err) {
      console.log(err);
    }
  })();
  return undefined;
};

// choose seat => given seat id, add the seat to the chooseSeats array
function addSeatIntoChosenSeatsArray(id) {
  const seatId = parseInt(id);
  if (chosenSeats.indexOf(seatId) === -1) {
    chosenSeats.push(seatId);
  } else if (chosenSeats.indexOf(seatId) > -1) {
    return;
  }
  return;
}

// delete seat => given seat id, remove the seat from the chooseSeats array
function removeSeatFromChosenSeatsArray(id) {
  const index = chosenSeats.indexOf(parseInt(id));
  if (index > -1) {
    chosenSeats.splice(index, 1);
  }
  return;
}

const SEAT_STATUS = {
  CHOOSE: 1,
  DELETE: 0,
};

function renderSeats(res) {
  countOfCartAndSold = res.countOfCartAndSold;
  let row = 0;
  res.data.forEach((e) => {
    const { status, seatRow, concertSeatId } = e;
    if (parseInt(seatRow) !== row) {
      $("#seats-table-list").append(`<tr id="row-${seatRow}"></tr>`);
      row++;
    }

    if (status === "not-selected") {
      $(`#row-${seatRow}`).append(
        `<td>
        <img src="../images/logo/icon_chair_not_selected.gif" class="not-selected" id="${concertSeatId}" title ="" width="100%">
        </td>`
      );
    } else if (status === "selected") {
      $(`#row-${seatRow}`).append(
        `<td><img src="../images/logo/icon_chair_selected.gif" class = "selected" id = "${concertSeatId}" width="100%"></td>`
      );
    } else if (status === "you-selected" && pageAccessedByReload) {
      $(`#row-${seatRow}`).append(
        `<td><img src="../images/logo/icon_chair_select.gif" class="you-selected" id = "${concertSeatId}" width="100%"></td>`
      );

      addSeatIntoChosenSeatsArray(concertSeatId);
      $.ajax({
        url: "/api/1.0/order/chooseOrDeleteSeat",
        data: JSON.stringify({
          seatStatus: SEAT_STATUS.CHOOSE,
          concertSeatId,
        }),
        method: "POST",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        headers: {
          Authorization: `Bearer ${Authorization}`,
          SocketId: socketId,
        },
        success: function () {
          console.log("success!");
        },
        error: function (res) {
          removeSeatFromChosenSeatsArray(concertSeatId);
          Swal.fire({
            title: JSON.parse(res.responseText).error,
            icon: "error",
            showConfirmButton: false,
            timer: 1000,
          });
        },
      });
    } else if (status === "you-selected" && !pageAccessedByReload) {
      addSeatIntoChosenSeatsArray(concertSeatId);
      $(`#row-${seatRow}`).append(
        `<td><img src="../images/logo/icon_chair_select.gif" class="you-selected" id = "${concertSeatId}" width="100%"></td>`
      );
    } else if (status === "cart") {
      $(`#row-${seatRow}`).append(`<td><img src="../images/logo/icon_chair_cart.gif" class = "cart" id = "${concertSeatId}" width="100%"></td>`);
    } else if (status === "you-cart") {
      $(`#row-${seatRow}`).append(`<td><img src="../images/logo/icon_chair_cart.gif" class = "you-cart" id = "${concertSeatId}" width="100%"></td>`);
    } else if (status === "sold") {
      $(`#row-${seatRow}`).append(`<td><img src="../images/logo/icon_chair_sold.gif" class = "sold" id = "${concertSeatId}" width="100%"></td>`);
    } else if (status === "you-sold") {
      $(`#row-${seatRow}`).append(`<td><img src="../images/logo/icon_chair_sold.gif" class = "you-sold" id = "${concertSeatId}" width="100%"></td>`);
    }

    $(`#${concertSeatId}`).click(handleClick);
  });
}

function handleClick() {
  if (!isZero) {
    const cls = this.className;
    const id = $(this).attr("id");

    switch (cls) {
      case "not-selected":
        if ($(".you-selected").length + countOfCartAndSold < 4) {
          (async function () {
            await chooseSeat(id);
          })();
        } else {
          Swal.fire({
            position: "center",
            icon: "error",
            width: 600,
            title: "每人每場限購四張，您已達到選位上限!!!",
            showConfirmButton: false,
            timer: 1500,
          });
        }
        break;
      case "you-selected":
        (async function () {
          await cancelSeat(id);
        })();
        break;
      case "selected":
      case "cart":
      case "you-cart":
      case "sold":
      case "you-sold":
        break;
    }
  }
}

function redirect(concertId) {
  return new Promise((resolve, reject) => {
    window.location.assign(`/campaign.html?id=${concertId}`);
    resolve(true);
  });
}

function chooseSeat(seatId) {
  return new Promise((resolve, reject) => {
    addSeatIntoChosenSeatsArray(seatId);
    $.ajax({
      url: "/api/1.0/order/chooseOrDeleteSeat",
      data: JSON.stringify({
        seatStatus: SEAT_STATUS.CHOOSE,
        concertSeatId: seatId,
      }),
      method: "POST",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      headers: {
        Authorization: `Bearer ${Authorization}`,
        SocketId: socketId,
      },
      beforeSend: function () {
        Swal.fire({
          title: "座位預訂中...",
          position: "center",
          icon: "info",
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      },
      success: function () {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "已成功訂位!!!",
          showConfirmButton: false,
          timer: 1000,
        });
        resolve(true);
      },
      error: function (res) {
        removeSeatFromChosenSeatsArray(seatId);
        Swal.fire({
          title: JSON.parse(res.responseText).error,
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
        });

        reject(false);
      },
    });
  });
}

function cancelSeat(seatId) {
  return new Promise((resolve, reject) => {
    removeSeatFromChosenSeatsArray(seatId);
    $.ajax({
      url: "/api/1.0/order/chooseOrDeleteSeat",
      data: JSON.stringify({
        seatStatus: SEAT_STATUS.DELETE,
        concertSeatId: seatId,
      }),
      method: "POST",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      headers: {
        Authorization: `Bearer ${Authorization}`,
        SocketId: socketId,
      },
      beforeSend: function () {
        Swal.fire({
          title: "座位取消中...",
          position: "center",
          icon: "info",
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      },
      success: function () {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "已成功取消訂位!!!",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: function (res) {
        addSeatIntoChosenSeatsArray(seatId);
        Swal.fire({
          title: JSON.parse(res.responseText).error,
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
        });
      },
    });
  });
}

function rollBackChoose() {
  return new Promise((resolve, reject) => {
    const filterChosenSeats = chosenSeats.filter((ele, pos) => chosenSeats.indexOf(ele) == pos);
    if (filterChosenSeats.length === 0) {
      return;
    }
    $.ajax({
      url: "/api/1.0/order/rollBackChoose",
      data: JSON.stringify({ chosenSeats: filterChosenSeats }),
      async: true,
      method: "POST",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      headers: {
        Authorization: `Bearer ${Authorization}`,
        SocketId: socketId,
      },
      success: function (res) {
        resolve(true);
      },
      error: function (res) {
        reject(false);
        Swal.fire({
          title: JSON.parse(res.responseText).error,
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
        });
      },
    });
  });
}

$.ajax({
  url: `/api/1.0/order/chosenConcertInfo?concertAreaPriceId=${concertAreaPriceId}`,
  method: "GET",
  dataType: "json",
  contentType: "application/json;charset=utf-8",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    $(function () {
      const { concertTitle, concertDatetime, concertLocation, concertArea, ticketPrice } = res.data[0];

      $("#concert-title").text(concertTitle);
      $("#time-location-block").html(`<p>時間：${concertDatetime}&nbsp; &nbsp; 地點：${concertLocation}</p>`);
      $("#area-ticketPrice").html(`<p> 票區：${concertArea}&nbsp; &nbsp; 票價：NT$${ticketPrice}</p>`);
    });
  })
  .fail(function (res) {
    if (!Authorization) {
      Swal.fire({
        title: "請先登入",
        icon: "error",
        showConfirmButton: false,
        timer: 1200,
      }).then(function () {
        window.location = "/profile.html";
      });
    } else {
      Swal.fire({
        title: JSON.parse(res.responseText).error,
        icon: "error",
        showConfirmButton: false,
        timer: 1200,
      }).then(function () {
        window.location = "/";
      });
    }
  });

$.ajax({
  url: `/api/1.0/order/seatStatus?concertAreaPriceId=${concertAreaPriceId}`,
  method: "GET",
  dataType: "json",
  contentType: "application/json;charset=utf-8",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    $(document).ready(function () {
      renderSeats(res);
      // 60 seconds countdown
      let count = 60;
      $("#notice").html(
        `<pre> ★ 購票提醒：
        1. 單場演唱會，每人限購4張(可跨區)
        2. 請於60秒內選好座位，並將選好的座位加入購物車，否則系統會將您導回活動頁，並清空您所選座位
        3. 勿重新刷新此頁面！重新刷新頁面者，系統會清空您所選的座位</pre>`
      );
      $("#count").html(`倒 數 ${count} 秒`);
      let timer = null;
      timer = setInterval(function () {
        if (count > 0) {
          if (count === 1) {
            isZero = true;
          }
          count = count - 1;
          $("#count").html(`倒 數 ${count} 秒`);
        } else {
          // when count = 0, stop timing
          isZero = true;
          clearInterval(timer);
          window.location.assign(`/campaign.html?id=${concertId}`);
        }
      }, 1000);

      $(".chair-style").html(
        `
      <ul>
          <li><img src="../images/logo/icon_chair_not_selected.gif" width="40" height="40" alt="空位"/> 空位 </li>
          <li><img src="../images/logo/icon_chair_sold.gif" width="40" height="40" alt="已售出"/> 已售出 </li>
          <li><img src="../images/logo/icon_chair_selected.gif" width="40" height="40" alt="已被他人選擇"/> 已被他人選擇 </li>
          <li><img src="../images/logo/icon_chair_select.gif" width="40" height="40" alt="已被您選擇"/> 已被您選擇 </li>
          <li><img src="../images/logo/icon_chair_cart.gif" width="40" height="40" alt="已加入購物車" /> 已加入購物車 </li>
      </ul>
      `
      );
      $("#add-to-cart").append(`<button id = "add-to-cart-button" onclick = "addToCart()">加入購物車</button>`);
    });
  })
  .fail(function (res) {
    if (!Authorization) {
      Swal.fire({
        title: "請先登入",
        icon: "error",
        showConfirmButton: false,
        timer: 1200,
      }).then(function () {
        window.location = "/profile.html";
      });
    } else {
      Swal.fire({
        title: JSON.parse(res.responseText).error,
        icon: "error",
        showConfirmButton: false,
        timer: 1000,
      }).then(function () {
        window.location = "/";
      });
    }
  });

function addToCart() {
  const filterChosenSeats = chosenSeats.filter((ele, pos) => chosenSeats.indexOf(ele) == pos);
  $.ajax({
    url: "/api/1.0/order/addToCart",
    data: JSON.stringify({ chosenSeats: filterChosenSeats }),
    async: true,
    method: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    headers: {
      Authorization: `Bearer ${Authorization}`,
      SocketId: socketId,
    },
    beforeSend: function () {
      if (chosenSeats.length !== 0) {
        Swal.fire({
          title: "座位加入購物車中，請稍後...",
          position: "center",
          icon: "info",
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    },
  })
    .done(function (res) {
      $(function () {
        Swal.close();
        // after adding the selected seat to the shopping cart, clear the chosenSeats array
        chosenSeats = [];
        window.location.assign("/shoppingCart.html");
      });
    })
    .fail(function (res) {
      Swal.fire({
        title: JSON.parse(res.responseText).error,
        icon: "error",
        showConfirmButton: false,
        timer: 1000,
      });
    });
}
