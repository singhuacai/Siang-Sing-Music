urlParams = new URLSearchParams(window.location.search);
mainOrderCode = urlParams.get("number");
const Authorization = localStorage.getItem("Authorization");

// get all query string's key
let keys = [];
for (var key of urlParams.keys()) {
  keys.push(key);
}

$("#order-flow-step").html(
  `<img
    id="order-flow-step-img"
    src="../images/order_flow/Step4.png"
    alt="step4-ChooseArea"
    title="step4-ChooseArea" 
    width="600px"
  />`
);

if (keys.length !== 1 || !mainOrderCode) {
  alert("Error: 您提供的資訊錯誤 !");
  window.location.assign("/");
}

// Get the order result
$.ajax({
  url: `/api/1.0/order/orderResult?mainOrderCode=${mainOrderCode}`,
  method: "get",
  dataType: "json",
  contentType: "application/json;charset=utf-8",
  headers: { Authorization: `Bearer ${Authorization}` },
  beforeSend: function () {
    Swal.fire({
      title: "訂票結果載入中...",
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
      if (res.orderResult.length === 0) {
        $("#order-complete-title").hide();
        $("#thanks-text").hide();
        $("#empty-order-text").show();
        $("order-result-title").show();
        $("#empty-order-text").text("查詢不到此訂單的內容");
      } else {
        $("#order-complete-title").show();
        $("thanks-text").show();
        $("#order-number").text(`訂單編號：${mainOrderCode}`);
        $("#order-result-table").show();
        for (let i = 0; i < res.orderResult.length; i++) {
          const orderResult = res.orderResult[i];
          const {
            concertTitle,
            concertDatetime,
            concertLocation,
            concertArea,
            seatRow,
            seatColumn,
            ticketPrice,
          } = orderResult;
          $("#order-result").append(
            `
          <tr class = "order-item">
          <td class = "concert-title">${concertTitle}</td>
          <td class = "concert-date-time">${concertDatetime}</td>
          <td class = "concert-location">${concertLocation}</td>
          <td class = "concert-seat">${concertArea} 區  ${seatRow}排 ${seatColumn}號</td>
          <td class = "price">NT$ ${ticketPrice}</td>
          <td class= "ticket-status">已付款<br>待出貨</td>
          </tr>
          `
          );
        }

        $("#order-result").append(`
            <tr id="sum">
              <td> 總票價 </td>
              <td class = "price-sum"></td>
              <td> 運費 </td>
              <td class = "freight">NT$ 50 </td>
              <td> 合計 </td>
              <td class = "total"></td>
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

//// reorganize the total cost
function flushSumPrice() {
  let sum = 0;
  let total = 0;
  let freight = 50;
  $(".price").each(function () {
    sum += parseInt($(this).text().substr(3));
  });
  $(".price-sum").text("NT$ " + sum);
  total = sum + freight;
  $(".total").text(`NT$ ${total}`);
}
