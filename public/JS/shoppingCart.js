let Authorization = localStorage.getItem("Authorization");
var sum = 0;
$("#order-flow-step").html(
  `<img
    id="order-flow-step-img"
    src="../images/order_flow/Step3.png"
    alt="step1-ChooseArea"
    title="step1-ChooseArea" 
    width="800px"
  />`
);

$("#shopping-cart-title").text("購物車資訊");

$.ajax({
  url: "/api/1.0/order/cartStatus",
  method: "GET",
  dataType: "json",
  contentType: "application/json;charset=utf-8",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    $(function () {
      console.log(res);
      $("#cart-table").show();
      let concertSeatId;
      for (let i = 0; i < res.cartStatus.length; i++) {
        concertSeatId = res.cartStatus[i].concertSeatId;
        const cartStatus = res.cartStatus[i];
        console.log(`concertSeatId:${concertSeatId}`);
        $("#cart-concent").append(
          `
        <tr>
          <td>${cartStatus.concert_title}</td>
          <td>${cartStatus.concert_datetime}</td>
          <td>${cartStatus.concert_location}</td>
          <td>${cartStatus.concert_area} 區  ${cartStatus.concert_area_seat_row}排 ${cartStatus.concert_area_seat_column}號</td>
          <td id = "seat_${concertSeatId}_price">NT$ ${cartStatus.ticket_price}</td>
          <td class="cart-remove-block"><img src="../images/logo/cart-remove.png" class = "remove-button" width="20%" title="刪除"></td>
        </tr>
        `
        );

        // <td><button class = "remove-button" onclick = " ">移除購物車</button></td>
        // 計算總和
        sum += cartStatus.ticket_price;
      }
      console.log(sum);
      $("#cart-concent").append(
        `<tr id="sum"> 
          <td colspan="4"> 合計 </td> 
          <td colspan="2"> NT$ ${sum} </td> 
        </tr>
        `
      );
    });
  })
  .fail(function (res) {
    if (!Authorization) {
      alert("請先登入");
      window.location.assign("/profile.html");
    } else {
      alert(`Error: ${res.responseText}.`);
      window.location.assign("/");
    }
  });
