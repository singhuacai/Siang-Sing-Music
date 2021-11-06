const Authorization = localStorage.getItem("Authorization");

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

// 取得購物車狀態
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
            if (res.cartStatus.length === 0) {
                // 購物車是空的
                $("#cart-empty-text").show();
                $("#cart-empty-text").text("購物車空空的~~~快點去搶票吧!GO!GO!");
            } else {
                // 購物車內有東西
                $("#cart-table").show();
                let concertSeatId;
                let shoppingCartId;
                for (let i = 0; i < res.cartStatus.length; i++) {
                    const cartStatus = res.cartStatus[i];
                    concertSeatId = cartStatus.concertSeatId;
                    shoppingCartId = cartStatus.shoppingCartId;

                    $("#cart-concent").append(
                        `
            <tr class = "cart-item" id = "item-of-cart-${shoppingCartId}">
              <td class = "concert-title">${cartStatus.concert_title}</td>
              <td class = "concert-date-time">${cartStatus.concert_datetime}</td>
              <td class = "concert-location">${cartStatus.concert_location}</td>
              <td class = "concert-seat">${cartStatus.concert_area} 區  ${cartStatus.concert_area_seat_row}排 ${cartStatus.concert_area_seat_column}號</td>
              <td class = "price">NT$ ${cartStatus.ticket_price}</td>
              <td class="cart-remove-block"><img src="../images/logo/cart-remove.png" id = "seat-${concertSeatId}-delete" class = "remove-button" width="20%" title="刪除"></td>
            </tr>
            `
                    );

                    // 為每一個刪除鈕註冊事件
                    $(`#seat-${concertSeatId}-delete`).click({ param: concertSeatId }, deleteSeat);
                }
                // 合計總費用區塊
                $("#cart-concent").append(
                    `<tr id="sum">
          <td colspan="4"> 合計 </td>
          <td colspan="2" class = "price-sum"></td>
        </tr>
        `
                );

                flushSumPrice();
            }
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

// 將加入購物車中的票移除
function deleteSeat(event) {
    const concertSeatId = event.data.param;
    $.ajax({
        url: "/api/1.0/order/removeItemFromCart",
        data: JSON.stringify({ deleteSeatId: concertSeatId }),
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
                $(`#item-of-seat-${concertSeatId}`).remove();
                flushSumPrice();
                // alert("已成功將票從購物車移除!!!");
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "已成功將票從購物車移除!!!",
                    showConfirmButton: false,
                    timer: 1000,
                });

                // 若文件中沒有 ".cart-item" => 顯示下方通知
                if (!$("tr").hasClass("cart-item")) {
                    $("#cart-table").hide();
                    $("#cart-empty-text").show();
                    $("#cart-empty-text").text("購物車空空的~~~快點去搶票吧!GO!GO!");
                }
            });
        })
        .fail(function (res) {
            if (!Authorization) {
                alert("請先登入");
                window.location.assign("/profile.html");
            } else {
                Swal.fire("Error", res.responseText, "error");
                window.location.assign("/");
            }
        });
}

//重新整理總費用
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
