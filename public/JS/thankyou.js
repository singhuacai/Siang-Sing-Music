const urlParams = new URLSearchParams(window.location.search);
const mainOrderCode = urlParams.get("number");
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
    width="800px"
  />`
);

if (keys.length !== 1) {
    alert("Error: URL is wrong!");
    window.location.assign("/");
}

if (!mainOrderCode) {
    alert("Error: number is required!");
    window.location.assign("/");
}

// 取得訂票結果
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
                // 查詢不到此訂單的內容
                $("#empty-order-text").show();
                $("#empty-order-text").text("查詢不到此訂單的內容");
            } else {
                $("#order-number").text(`訂單編號：${mainOrderCode}`);
                $("#order-result-table").show();
                for (let i = 0; i < res.orderResult.length; i++) {
                    const orderResult = res.orderResult[i];
                    $("#order-result").append(
                        `
                    <tr class = "order-item">
                    <td class = "concert-title">${orderResult.concert_title}</td>
                    <td class = "concert-date-time">${orderResult.concert_datetime}</td>
                    <td class = "concert-location">${orderResult.concert_location}</td>
                    <td class = "concert-seat">${orderResult.concert_area} 區  ${orderResult.concert_area_seat_row}排 ${orderResult.concert_area_seat_column}號</td>
                    <td class = "price">NT$ ${orderResult.ticket_price}</td>
                    <td class= "ticket-status">已付款，待出貨</td>
                    </tr>
                    `
                    );
                }

                // 總票價
                $("#order-result").append(`
                    <tr id="sum">
                    <td colspan="4"> 總票價 </td>
                    <td colspan="2" class = "price-sum"></td>
                    </tr>
                `);

                // 運費
                $("#order-result").append(`
                    <tr id="freight">
                    <td colspan="4"> 運費 </td>
                    <td colspan="2" class = "freight">NT$ 50 </td>
                    </tr>
                `);

                // 合計
                $("#order-result").append(`
                    <tr id="total">
                    <td colspan="4"> 合計 </td>
                    <td colspan="2" class = "total"></td>
                    </tr>
                `);

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

//重新整理總費用
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
