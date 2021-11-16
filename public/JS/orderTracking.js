const Authorization = localStorage.getItem("Authorization");

// 取得訂票結果
$.ajax({
  url: `/api/1.0/order/orderResult`,
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
      console.log(res);
      if (res.orderResult.length === 0) {
        // 尚無訂單紀錄
        $("#empty-order-text").show();
        $("#empty-order-text").text("尚無訂單紀錄");
      } else {
        $(".order-main-info-table").show();
        for (let i = 0; i < res.orderResult.length; i++) {
          const orderResult = res.orderResult[i];
          const NumberOfTickets = orderResult.ticket_info.length;
          $(".order-main-info-table").append(
            `
                        <div class = "content">
                            <table class="content">
                                <thead>
                                    <tr id="column-name">
                                        <th width="15%">訂單編號</th>
                                        <th width="12%">訂購時間</th>
                                        <th width="10%">訂單狀態</th>
                                        <th width="18%">活動名稱</th>
                                        <th width="10%">日期時間</th>
                                        <th width="15%">地點</th>
                                        <th width="10%">座位</th>
                                        <th width="10%">價格</th>
                                    </tr>
                                </thead>
                                <tbody id="order-main-info-${i}">
                                    <tr class="order-item-0">
                                        <td rowspan="${NumberOfTickets}" class="order-code">${orderResult.main_order_code}</td>
                                        <td rowspan="${NumberOfTickets}" class="order-time">${orderResult.created_at}</td>
                                        <td rowspan="${NumberOfTickets}" class="order-status">${orderResult.order_status}</td>
                                        <td class="concert-title">${orderResult.ticket_info[0].concert_title}</td>
                                        <td class="concert-datetime">${orderResult.ticket_info[0].concert_datetime}</td>
                                        <td class="concert-location">${orderResult.ticket_info[0].concert_location}</td>
                                        <td class="concert-seat">
                                            ${orderResult.ticket_info[0].concert_area} 區 <br>
                                            ${orderResult.ticket_info[0].row}排
                                            ${orderResult.ticket_info[0].column}號
                                        </td>
                                        <td class="price-${i} price">NT$ ${orderResult.ticket_info[0].ticket_price}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        `
          );

          if (NumberOfTickets > 1) {
            for (let j = 1; j < NumberOfTickets; j++) {
              $(`#order-main-info-${i}`).append(
                `
                                <tr class="order-item-${j}">
                                    <td class="concert-title">${orderResult.ticket_info[j].concert_title}</td>
                                    <td class="concert-datetime">${orderResult.ticket_info[j].concert_datetime}</td>
                                    <td class="concert-location">${orderResult.ticket_info[j].concert_location}</td>
                                    <td class="concert-seat">
                                        ${orderResult.ticket_info[j].concert_area} 區 <br>
                                        ${orderResult.ticket_info[j].row}排
                                        ${orderResult.ticket_info[j].column}號
                                    </td>
                                    <td class="price-${i}">NT$ ${orderResult.ticket_info[j].ticket_price}</td>
                                </tr>
                                `
              );
            }
          }

          // 總票價 + 運費 + 合計
          $(`#order-main-info-${i}`).append(`
                        <tr>
                        <td colspan="1" id="sum-${i}"> 總票價 </td>
                        <td colspan="1" class = "price-sum-${i}"></td>
                        <td colspan="1" id="freight-${i}"> 運費 </td>
                        <td colspan="1" class = "freight">NT$ 50 </td>
                        <td colspan="1" id="total-${i}"> 合計 </td>
                        <td colspan="3" class = " total total-${i}"></td>
                        </tr>
                    `);

          flushSumPrice(i);
        }
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

//重新整理總費用
function flushSumPrice(i) {
  let sum = 0;
  let total = 0;
  let freight = 50;
  $(`.price-${i}`).each(function () {
    sum += parseInt($(this).text().substr(3));
  });
  $(`.price-sum-${i}`).text("NT$ " + sum);
  total = sum + freight;
  $(`.total-${i}`).text(`NT$ ${total}`);
}
