let urlParams = new URLSearchParams(window.location.search);
let concertId = urlParams.get("concertId");
let concertDateId = urlParams.get("concertDateId");
let concertAreaPriceId = urlParams.get("concertAreaPriceId");
let Authorization = localStorage.getItem("Authorization");

if (concertAreaPriceId) {
  window.onbeforeunload = function () {
    alert("HIHIHIHI");
    return "您輸入的內容尚未儲存，確定離開此頁面嗎？";
  };
  // $(window).bind("beforeunload", function () {
  //   return "您輸入的內容尚未儲存，確定離開此頁面嗎？";
  // });
  function renderSeats(res) {
    console.log(res);
    let row = 0;
    for (let i = 0; i < res.data.length; i++) {
      if (parseInt(res.data[i].concert_area_seat_row) !== row) {
        $("#seats-table-list").append(
          `<tr id="row-${res.data[i].concert_area_seat_row}"></tr>`
        );
        row++;
      }
      if (res.data[i].status === "not-selected") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td>
        <img src="../images/logo/icon_chair_not_selected.gif" class="not-selected" id="${res.data[i].concert_seat_id}" title ="" width="100%" >
        </td>`
        );
      } else if (res.data[i].status === "selected") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_selected.gif" class = "selected" id = "${res.data[i].concert_seat_id}" width="100%" ></td>`
        );
      } else if (res.data[i].status === "you-selected") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_select.gif" class="you-selected" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (res.data[i].status === "cart") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_cart.gif" class = "cart" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (res.data[i].status === "you-cart") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_cart.gif" class = "you-cart" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (res.data[i].status === "sold") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_sold.gif" class = "sold" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      } else if (res.data[i].status === "you-sold") {
        $(`#row-${res.data[i].concert_area_seat_row}`).append(
          `<td><img src="../images/logo/icon_chair_sold.gif" class = "you-sold" id = "${res.data[i].concert_seat_id}" width="100%"></td>`
        );
      }

      $(`#${res.data[i].concert_seat_id}`).click(handleClick);
    }
  }

  function handleClick() {
    console.log("handleClick!");
    const cls = this.className;
    console.log(cls);
    var id = $(this).attr("id");
    console.log(id);

    switch (cls) {
      case "not-selected":
        if (
          $(".you-selected").length +
            $(".you-cart").length +
            $(".you-sold").length <
          4
        ) {
          console.log("run selected function");
          chooseSeat(id);
        } else {
          alert("每人每場限購四張，您已達到選位上限!");
        }
        break;
      case "you-selected":
        console.log("run un-selected function");
        cancelSeat(id);
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

  function chooseSeat(seatId) {
    console.log("not selected");
    if (
      $(".you-selected").length +
        $(".you-cart").length +
        $(".you-sold").length >=
      4
    ) {
      alert("每人每場限購四張，您已達到選位上限!");
    } else {
      $.ajax({
        url: "/api/1.0/order/chooseOrDeleteSeat",
        data: JSON.stringify({
          seatStatus: 1,
          concertSeatId: seatId,
        }),
        method: "POST",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        headers: { Authorization: `Bearer ${Authorization}` },
      })
        .done(function (res) {
          $(function () {
            $(`#${seatId}`)
              .removeClass("not-selected")
              .addClass("you-selected");
            $(`#${seatId}`).attr("src", "../images/logo/icon_chair_select.gif");
          });
        })
        .fail(function (res) {
          alert(`Error: ${res.responseText}.`);
        });
    }
  }

  function cancelSeat(seatId) {
    console.log("selected");
    $.ajax({
      url: "/api/1.0/order/chooseOrDeleteSeat",
      data: JSON.stringify({
        seatStatus: 0,
        concertSeatId: seatId,
      }),
      method: "POST",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      headers: { Authorization: `Bearer ${Authorization}` },
    })
      .done(function (res) {
        $(function () {
          $(`#${seatId}`).removeClass("you-selected").addClass("not-selected");
          $(`#${seatId}`).attr(
            "src",
            "../images/logo/icon_chair_not_selected.gif"
          );
        });
      })
      .fail(function (res) {
        alert(`Error: ${res.responseText}.`);
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

        // $("#content-block").html(
        //   `
        //   `
        // );

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
      alert(`Error: ${res.responseText}.`);
      window.location.assign("/");
    });

  $.ajax({
    url: `/api/1.0/order/seatStatus?concertAreaPriceId=${concertAreaPriceId}`,
    method: "GET",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    headers: { Authorization: `Bearer ${Authorization}` },
  })
    .done(function (res) {
      $(function () {
        console.log(res);

        renderSeats(res);
        // ================================================
        // 倒數計時器(60秒)
        $(document).ready(function () {
          let count = 60;
          $("#notice").html(
            `<p>&nbsp;&nbsp; 請您於60秒內選好座位，並將選好的座位加入購物車，否則將會將您導回首頁 &nbsp;&nbsp;</p>`
          );
          $("#count").html(`倒 數 ${count} 秒`);
          let timer = null;
          timer = setInterval(function () {
            if (count > 0) {
              count = count - 1;
              $("#count").html(`倒 數 ${count} 秒`);
            } else {
              clearInterval(timer); // 當count = 0 時，停止計時
              // window.location.assign("/");
            }
          }, 1000);
        });
        // ================================================

        $(".chair-style").html(
          `
          <ul>
            <li><img src="../images/logo/icon_chair_not_selected.gif" width="40" height="40" alt="空位"/> 空位 </li>
            <li><img src="../images/logo/icon_chair_sold.gif" width="40" height="40" alt="已售出"/> 已售出 </li>
            <li><img src="../images/logo/icon_chair_selected.gif" width="40" height="40" alt="已被他人選擇"/> 已被他人選擇 </li>
            <li><img src="../images/logo/icon_chair_select.gif" width="40" height="40" alt="已被你選擇"/> 已被選擇 </li>
            <li> <img src="../images/logo/icon_chair_cart.gif" width="40" height="40" alt="已加入購物車" /> 已加入購物車 </li>
          </ul>
          `
        );
        $("#add-to-cart").append(
          `<button id = "add-to-cart-button" onclick = "">加入購物車</button>`
        );
      });
    })
    .fail(function (res) {
      alert(`Error: ${res.responseText}.`);
      window.location.assign("/");
    });
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
      alert(`Error: ${res.responseText}.`);
      window.location.assign("/");
    });
}
