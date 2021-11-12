let urlParams = new URLSearchParams(window.location.search);
let concertId = urlParams.get("concertId");
let concertDateId = urlParams.get("concertDateId");
let concertAreaPriceId = urlParams.get("concertAreaPriceId");
let Authorization = localStorage.getItem("Authorization");
let UserCode = localStorage.getItem("UserCode");
var chosenSeats = [];
let countOfCartAndSold = 0;

var isZero = false;

// 限定使用者只能開啟一個分頁
// (function() {
//   'use strict';
//   const myChannel = new BroadcastChannel('myChannel');
//   myChannel.onmessage = () => {
//     document.location.replace(`/index.html`);
//   }
//   myChannel.postMessage('page opened');
// })();

if (concertAreaPriceId) {
  // 限制使用者當已進入購物車頁面時，不能透過"上一頁"回到此頁
  window.history.forward(1);

  // 偵測頁面是否重新刷新
  const pageAccessedByReload =
    (window.performance.navigation &&
      window.performance.navigation.type === 1) ||
    window.performance
      .getEntriesByType("navigation")
      .map((nav) => nav.type)
      .includes("reload");

  // 若在此頁重新刷新頁面 => 轉導到活動頁面
  // if (pageAccessedByReload) {
  //   window.location.assign(`/campaign.html?id=${concertId}`);
  // }

  // socket.io
  let socketId = null;
  var socket = io({
    query: { concertAreaPriceId },
    auth: (cb) => {
      cb({ token: localStorage.getItem("Authorization") });
    },
  });

  socket.on("ClientSocketId", (msg) => {
    console.log(`ClientSocketId : ${msg}`);
    socketId = msg;
  });

  socket.on("NotifySeatSelect", (msg) => {
    msg = JSON.parse(msg);
    console.log(msg, msg.seat_id, msg.owner);
    if (msg.owner === localStorage.getItem("UserCode")) {
      $(`#${msg.seat_id}`).removeClass("not-selected").addClass("you-selected");
      $(`#${msg.seat_id}`).attr("src", "../images/logo/icon_chair_select.gif");
      addSeatIntoChosenSeatsArray(msg.seat_id);
    } else {
      if ($(`#${msg.seat_id}`).hasClass("not-selected")) {
        $(`#${msg.seat_id}`).removeClass("not-selected").addClass("selected");
        $(`#${msg.seat_id}`).attr(
          "src",
          "../images/logo/icon_chair_selected.gif"
        );
      } else if ($(`#${msg.seat_id}`).hasClass("you-selected")) {
        $(`#${msg.seat_id}`).removeClass("you-selected").addClass("selected");
        $(`#${msg.seat_id}`).attr(
          "src",
          "../images/logo/icon_chair_selected.gif"
        );
      }
    }
  });

  socket.on("NotifySeatDelete", (msg) => {
    msg = JSON.parse(msg);
    console.log(msg, msg.seat_id, msg.owner);
    if (msg.owner === localStorage.getItem("UserCode")) {
      $(`#${msg.seat_id}`).removeClass("you-selected").addClass("not-selected");
      $(`#${msg.seat_id}`).attr(
        "src",
        "../images/logo/icon_chair_not_selected.gif"
      );
      removeSeatFromChosenSeatsArray(msg.seat_id);
    } else {
      $(`#${msg.seat_id}`).removeClass("selected").addClass("not-selected");
      $(`#${msg.seat_id}`).attr(
        "src",
        "../images/logo/icon_chair_not_selected.gif"
      );
    }
  });

  socket.on("NotifyRollbackSeat", (msg) => {
    msg = JSON.parse(msg);
    console.log(msg, msg.rollBackSeat, msg.owner);
    if (msg.owner === localStorage.getItem("UserCode")) {
      for (let i = 0; i < msg.rollBackSeat.length; i++) {
        console.log(`yes!!`);
        $(`#${msg.rollBackSeat[i]}`)
          .removeClass("you-selected")
          .addClass("not-selected");
        $(`#${msg.rollBackSeat[i]}`).attr(
          "src",
          "../images/logo/icon_chair_not_selected.gif"
        );
      }
      chosenSeats = [];
      console.log(` (after rollback)chosenSeats:${chosenSeats}`);
    } else {
      for (let i = 0; i < msg.rollBackSeat.length; i++) {
        console.log(`OPPS`);
        $(`#${msg.rollBackSeat[i]}`)
          .removeClass("selected")
          .addClass("not-selected");
        $(`#${msg.rollBackSeat[i]}`).attr(
          "src",
          "../images/logo/icon_chair_not_selected.gif"
        );
      }
    }
  });

  socket.on("NotifyAddToCart", (msg) => {
    msg = JSON.parse(msg);
    console.log(msg, msg.addToCartSeat, msg.owner);
    if (msg.owner === localStorage.getItem("UserCode")) {
      for (let i = 0; i < msg.addToCartSeat.length; i++) {
        $(`#${msg.addToCartSeat[i]}`)
          .removeClass("you-selected")
          .addClass("you-cart");
        $(`#${msg.addToCartSeat[i]}`).attr(
          "src",
          "../images/logo/icon_chair_cart.gif"
        );
      }
      chosenSeats = [];
      countOfCartAndSold += msg.addToCartSeat.length;
    } else {
      for (let i = 0; i < msg.addToCartSeat.length; i++) {
        $(`#${msg.addToCartSeat[i]}`).removeClass("selected").addClass("cart");
        $(`#${msg.addToCartSeat[i]}`).attr(
          "src",
          "../images/logo/icon_chair_cart.gif"
        );
      }
    }
  });

  socket.on("NotifyRemoveFromCart", (msg) => {
    console.log(msg, msg.removeFromCartSeat, msg.owner);
    if (msg.owner === localStorage.getItem("UserCode")) {
      $(`#${msg.removeFromCartSeat}`)
        .removeClass("you-cart")
        .addClass("not-selected");
      $(`#${msg.removeFromCartSeat}`).attr(
        "src",
        "../images/logo/icon_chair_not_selected.gif"
      );
      countOfCartAndSold -= 1;
    } else {
      $(`#${msg.removeFromCartSeat}`)
        .removeClass("cart")
        .addClass("not-selected");
      $(`#${msg.removeFromCartSeat}`).attr(
        "src",
        "../images/logo/icon_chair_not_selected.gif"
      );
    }
  });

  socket.on("NotifyRemoveToOrder", (msg) => {
    msg = JSON.parse(msg);
    console.log(msg, msg.removeToOrderSeat, msg.owner);
    if (msg.owner === localStorage.getItem("UserCode")) {
      $(`#${msg.removeToOrderSeat}`)
        .removeClass("you-cart")
        .addClass("you-sold");
      $(`#${msg.removeToOrderSeat}`).attr(
        "src",
        "../images/logo/icon_chair_sold.gif"
      );
    } else {
      $(`#${msg.removeToOrderSeat}`).removeClass("cart").addClass("sold");
      $(`#${msg.removeToOrderSeat}`).attr(
        "src",
        "../images/logo/icon_chair_sold.gif"
      );
    }
  });

  socket.on("connect_error", (err) => {
    console.log(err instanceof Error); // true
    console.log(err.message); // not authorized
    console.log(err.data); // { content: "Please retry later" }
  });

  $(document).ready(function () {
    $(document).bind("keydown", function (e) {
      e = window.event || e;
      // 阻擋使用者按 F5 刷新頁面
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
  // 新增座位 => 給指定座位id, 將該座位加入 chooseSeats array
  function addSeatIntoChosenSeatsArray(id) {
    const seat_id = parseInt(id);
    if (chosenSeats.indexOf(seat_id) === -1) {
      chosenSeats.push(seat_id);
    } else if (chosenSeats.indexOf(seat_id) > -1) {
      console.log(seat_id + " already exists in the chosenSeats array.");
    }
    return;
  }

  // 刪除座位 => 給指定座位id, 將該座位移出 chooseSeats array
  function removeSeatFromChosenSeatsArray(id) {
    const index = chosenSeats.indexOf(parseInt(id));
    if (index > -1) {
      chosenSeats.splice(index, 1);
    }
    return;
  }

  function renderSeats(res) {
    countOfCartAndSold = res.countOfCartAndSold;
    let row = 0;
    for (let i = 0; i < res.data.length; i++) {
      if (parseInt(res.data[i].seat_row) !== row) {
        $("#seats-table-list").append(
          `<tr id="row-${res.data[i].seat_row}"></tr>`
        );
        row++;
      }
      const status = res.data[i].status;
      if (status === "not-selected") {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td>
          <img src="../images/logo/icon_chair_not_selected.gif" class="not-selected" id="${res.data[i].concert_seat_id}" title ="" width="100%" >
          </td>`
        );
      } else if (status === "selected") {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_selected.gif" class = "selected" id = "${res.data[i].concert_seat_id}" width="100%" ></td>`
        );
      } else if (status === "you-selected" && pageAccessedByReload) {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_select.gif" class="you-selected" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
        // 是否進入bug mode
        // alert(pageAccessedByReload);

        // 進入時，若座位狀態已有"you-selected"，再打一次 API 讓他真的被選起來
        addSeatIntoChosenSeatsArray(res.data[i].concert_seat_id);
        $.ajax({
          url: "/api/1.0/order/chooseOrDeleteSeat",
          data: JSON.stringify({
            seatStatus: 1,
            concertSeatId: res.data[i].concert_seat_id,
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
          fail: function (res) {
            removeSeatFromChosenSeatsArray(res.data[i].concert_seat_id);
            Swal.fire({
              title: JSON.parse(res.responseText).error,
              icon: "error",
              showConfirmButton: false,
              timer: 1000,
            });
          },
        });
      } else if (status === "you-selected" && !pageAccessedByReload) {
        addSeatIntoChosenSeatsArray(res.data[i].concert_seat_id);
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_select.gif" class="you-selected" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (status === "cart") {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_cart.gif" class = "cart" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (status === "you-cart") {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_cart.gif" class = "you-cart" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (status === "sold") {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_sold.gif" class = "sold" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (status === "you-sold") {
        $(`#row-${res.data[i].seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_sold.gif" class = "you-sold" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      }

      $(`#${res.data[i].concert_seat_id}`).click(handleClick);
    }
  }

  function handleClick() {
    if (!isZero) {
      const cls = this.className;
      const id = $(this).attr("id");
      console.log(`className:${cls}`);
      console.log(`buttonId:${id}`);

      switch (cls) {
        case "not-selected":
          if ($(".you-selected").length + countOfCartAndSold < 4) {
            console.log("run selected function");
            (async function () {
              try {
                await chooseSeat(id);
              } catch (err) {
                Swal.fire({
                  title: JSON.parse(res.responseText).error,
                  icon: "error",
                  showConfirmButton: false,
                  timer: 1000,
                });
              }
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
          console.log("run un-selected function");
          (async function () {
            try {
              await cancelSeat(id);
            } catch (err) {
              Swal.fire({
                title: JSON.parse(res.responseText).error,
                icon: "error",
                showConfirmButton: false,
                timer: 1000,
              });
            }
          })();
          break;
        case "selected":
        case "cart":
        case "you-cart":
        case "sold":
        case "you-sold":
          console.log(`you click ${cls}`);
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
      console.log("This seat is nobody selected");
      addSeatIntoChosenSeatsArray(seatId);
      $.ajax({
        url: "/api/1.0/order/chooseOrDeleteSeat",
        data: JSON.stringify({
          seatStatus: 1,
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
        fail: function (res) {
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
          seatStatus: 0,
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
        fail: function (res) {
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
      // 將剛剛選擇的座位rollback掉
      const filterChosenSeats = chosenSeats.filter(
        (ele, pos) => chosenSeats.indexOf(ele) == pos
      );
      console.log("The filtered array", filterChosenSeats);
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
          console.log(res);
          resolve(true);
        },
        fail: function (res) {
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
        console.log(res);

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
            width="800px"
        />`
        );
        $("#concert-title").text(`${res.data[0].concert_title}`);
        $("#time-location-block").html(
          `<p>時間：${res.data[0].concert_datetime}&nbsp; &nbsp; 地點：${res.data[0].concert_location}</p>`
        );
        $("#area-ticketPrice").html(
          `<p> 票區：${res.data[0].concert_area}&nbsp; &nbsp; 票價：NT$${res.data[0].ticket_price}</p>`
        );
      });
    })
    .fail(function (res) {
      if (!Authorization) {
        alert("請先登入");
        window.location.assign("/profile.html");
      } else {
        Swal.fire({
          title: JSON.parse(res.responseText).error,
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
        });
        window.location.assign("/");
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
      console.log(res);
      $(document).ready(function () {
        renderSeats(res);
        // ================================================
        // 倒數計時器(60秒)
        let count = 100;
        $("#notice").html(
          `<p>&nbsp;&nbsp; 請您於60秒內選好座位，並將選好的座位加入購物車，否則系統會將您導回活動頁 &nbsp;&nbsp;</p>`
        );
        $("#count").html(`倒 數 ${count} 秒`);
        let timer = null;
        timer = setInterval(function () {
          if (count > 1) {
            count = count - 1;
            $("#count").html(`倒 數 ${count} 秒`);
          } else if (count > 0) {
            isZero = true;
            console.log(`change=====`);
            count = count - 1;
            $("#count").html(`倒 數 ${count} 秒`);
          } else {
            // 當count = 0 時，停止計時
            isZero = true;
            clearInterval(timer);
            window.location.assign(`/campaign.html?id=${concertId}`);
          }
        }, 1000);
        // ================================================

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
        $("#add-to-cart").append(
          `<button id = "add-to-cart-button" onclick = "addToCart()">加入購物車</button>`
        );
      });
    })
    .fail(function (res) {
      if (!Authorization) {
        alert("請先登入");
        window.location.assign("/profile.html");
      } else {
        Swal.fire({
          title: JSON.parse(res.responseText).error,
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
        });
        window.location.assign("/");
      }
    });

  function addToCart() {
    // 將剛剛選擇的座位addToCart
    const filterChosenSeats = chosenSeats.filter(
      (ele, pos) => chosenSeats.indexOf(ele) == pos
    );
    console.log("The filtered array", filterChosenSeats);
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
          // 將所選位子加入購物車後，將 chosenSeats array 清空
          chosenSeats = [];
          for (let i = 0; i < res.addToCartSeat.length; i++) {
            $(`#${res.addToCartSeat[i]}`)
              .removeClass("you-selected")
              .addClass("you-cart");
            $(`#${res.addToCartSeat[i]}`).attr(
              "src",
              "../images/logo/icon_chair_cart.gif"
            );
          }
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
} else if (concertDateId) {
  $.ajax({
    url: `/api/1.0/order/performanceAndAreas?concertId=${concertId}&concertDateId=${concertDateId}`,
    method: "GET",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    headers: { Authorization: `Bearer ${Authorization}` },
  })
    .done(function (res) {
      $(function () {
        $("#content-block").html(
          `
        <div id="concert-area-image-and-choose-zone" class="content">
        <div id="concert-area-image"></div>
        <div id="choose-zone">
            <div id="choose-zone-title"></div>
            <div id="concert-zone-price-qty-list">
            <ul id="concert-zone-price-qty"></ul>
            </div>
        </div>
        </div>
        `
        );
        $("#order-flow-step").html(
          `<img
          id="order-flow-step-img"
          src="../images/order_flow/Step1.png"
          alt="step1-ChooseArea"
          title="step1-ChooseArea"
          width="800px"
          />`
        );

        $("#concert-title").text(`${res.concert_title}`);

        $("#time-location-block").html(
          `<p>時間：${res.concert_datetime}&nbsp; &nbsp; 地點：${res.concert_location}</p>`
        );

        $("#concert-area-image").html(
          `<img src="${res.concert_area_image}" alt="concert-area-image" title="concert area image"/>`
        );

        $("#choose-zone-title").text("請選擇區域");
        for (let i = 0; i < res.area_and_ticket_prices.length; i++) {
          const concertAreaPriceId =
            res.area_and_ticket_prices[i].concert_area_price_id;
          const { concert_area, ticket_price, total_seats } =
            res.area_and_ticket_prices[i];

          if (parseInt(res.area_and_ticket_prices[i].total_seats) === 0) {
            $("#concert-zone-price-qty").append(
              `
            <li id='${concertAreaPriceId}' class ="area-list">
                <div class = "concert-zone-price-qty">${concert_area}  NT$${ticket_price}   已無空座位可選</div>
            </li>
            `
            );
          } else {
            $("#concert-zone-price-qty").append(
              `
            <li id='${concertAreaPriceId}' class ="area-list">
                <a href="/order.html?concertId=${concertId}&concertDateId=${concertDateId}&concertAreaPriceId=${concertAreaPriceId}">
                <div class="concert-zone-price-qty" id = "${concert_area}">${concert_area} NT$${ticket_price}   剩餘 ${total_seats} 個空位</div>
                </a>
            </li>
            `
            );
          }
        }
      });
    })
    .fail(function (res) {
      if (!Authorization) {
        alert("請先登入");
        window.location.assign("/profile.html");
      } else {
        Swal.fire({
          title: JSON.parse(res.responseText).error,
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
        });
        window.location.assign("/");
      }
    });
}
