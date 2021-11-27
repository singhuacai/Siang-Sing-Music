const Authorization = localStorage.getItem("Authorization");

$("#order-flow-step").html(
  `<img
    id="order-flow-step-img"
    src="../images/order_flow/Step3.png"
    alt="step3-ChooseArea"
    title="step3-ChooseArea" 
    width="600px"
  />`
);

$("#shopping-cart-title").text("購物車資訊");

$.ajax({
  url: "/api/1.0/order/cartStatus",
  method: "GET",
  dataType: "json",
  contentType: "application/json;charset=utf-8",
  headers: { Authorization: `Bearer ${Authorization}` },
  beforeSend: function () {
    Swal.fire({
      title: "購物車狀態載入中...",
      position: "center",
      icon: "info",
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },
})
  .done(function (res) {
    $(function () {
      Swal.close();
      if (res.cartStatus.length === 0) {
        // shopping cart is empty
        $("#checkout-info div").hide();
        $("#cart-empty-text").show();
        $("#cart-empty-text").text("購物車空空的~~~快點去搶票吧!GO!GO!");
      } else {
        // shopping cart is not empty
        for (let i = 0; i < res.cartStatus.length; i++) {
          const {
            concertSeatId,
            shoppingCartId,
            concertTitle,
            concertDatetime,
            concertLocation,
            concertArea,
            seatRow,
            seatColumn,
            ticketPrice,
          } = res.cartStatus[i];

          $("#cart-table").show();
          $("#cart-content").append(
            `
            <tr class = "cart-item" id = "item-of-cart-${shoppingCartId}" >
            <td class = "concert-title" style="word-wrap:break-word;">${concertTitle} </td>
            <td class = "concert-date-time" style="word-wrap:break-word;">${concertDatetime}</td>
            <td class = "concert-location" style="word-wrap:break-word;">${concertLocation}</td>
            <td class = "concert-seat">${concertArea} 區 <br> ${seatRow}排 ${seatColumn}號</td>
            <td class = "price">NT$ ${ticketPrice}</td>
            <td class="cart-remove-block"><img src="../images/logo/cart-remove.png" id = "seat-${concertSeatId}-delete" class = "remove-button" width="35%" title="刪除"></td>
            </tr>
            `
          );

          $(`#seat-${concertSeatId}-delete`).click(
            { param1: concertSeatId, param2: shoppingCartId },
            deleteSeat
          );
        }

        $("#cart-content").append(`
            <tr id="sum">
            <td colspan="4"> 合計 </td>
            <td colspan="2" class = "price-sum"></td>
            </tr>
        `);
        flushSumPrice();
      }
    });
  })
  .fail(function (res) {
    if (!Authorization) {
      Swal.fire({
        title: "請先登入",
        icon: "error",
        showConfirmButton: false,
        timer: 1000,
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

// Remove the ticket added to the shopping cart
function deleteSeat(event) {
  const removeFromCartSeatId = event.data.param1;
  const shoppingCartId = event.data.param2;
  $.ajax({
    url: "/api/1.0/order/removeItemFromCart",
    data: JSON.stringify({ removeSeatId: removeFromCartSeatId }),
    method: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    headers: { Authorization: `Bearer ${Authorization}` },
    beforeSend: function () {
      Swal.fire({
        title: "座位正在從購物車移除中...",
        position: "center",
        icon: "info",
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    },
  })
    .done(function (res) {
      $(function () {
        console.log(res);
        $(`#item-of-cart-${shoppingCartId}`).remove();
        flushSumPrice();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "已成功將票從購物車移除!!!",
          showConfirmButton: false,
          timer: 1000,
        });

        // there is no ".cart-item" => show the notification below
        if (!$("tr").hasClass("cart-item")) {
          $("#cart-table").hide();
          $("#checkout-info div").hide();
          $("#cart-empty-text").show();
          $("#cart-empty-text").text("購物車空空的~~~快點去搶票吧!GO!GO!");
        }
      });
    })
    .fail(function (res) {
      if (!Authorization) {
        Swal.fire({
          title: "請先登入",
          icon: "error",
          showConfirmButton: false,
          timer: 1000,
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
}

// reorganize the total cost
function flushSumPrice() {
  let sum = 0;
  let total = 0;
  let freight = 50;
  $(".price").each(function () {
    sum += parseInt($(this).text().substr(3));
  });
  $(".price-sum ").text("NT$ " + sum);
  total = sum + freight;
  $(".total-price").text(`${sum}(票價) + ${freight}(系統服務費) = ${total}`);
}
