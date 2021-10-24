let urlParams = new URLSearchParams(window.location.search);
let concertId = urlParams.get("concertId");
let concertDateId = urlParams.get("concertDateId");
let concertAreaPriceId = urlParams.get("concertAreaPriceId");
let Authorization = localStorage.getItem("Authorization");
if (!concertAreaPriceId) {
  $.ajax({
    url: `/api/1.0/order/performanceAndAreas?concertId=${concertId}&concertDateId=${concertDateId}`,
    data: JSON.stringify({ concertId, concertDateId }),
    method: "GET",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    headers: { Authorization: `Bearer ${Authorization}` },
  })
    .done(function (res) {
      $(function () {
        $("#order-flow-step1").html(
          `<img
          id="order-flow-step1-img"
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
