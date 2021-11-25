urlParams = new URLSearchParams(window.location.search);
concertId = urlParams.get("concertId");
concertDateId = urlParams.get("concertDateId");
concertAreaPriceId = urlParams.get("concertAreaPriceId");
const Authorization = localStorage.getItem("Authorization");
const UserCode = localStorage.getItem("UserCode");

$.ajax({
  url: `/api/1.0/order/performanceAndAreas?concertId=${concertId}&concertDateId=${concertDateId}`,
  method: "GET",
  dataType: "json",
  contentType: "application/json;charset=utf-8",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    $(function () {
      const {
        concertTitle,
        concertDatetime,
        concertLocation,
        concertAreaImage,
        areasAndTicketPrices,
      } = res;

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
          width="600px"
          />`
      );

      $("#concert-title").text(`${concertTitle}`);

      $("#time-location-block").html(
        `<p>時間：${concertDatetime}&nbsp; &nbsp; 地點：${concertLocation}</p>`
      );

      $("#concert-area-image").html(
        `<img src="${concertAreaImage}" alt="concert-area-image" title="concert area image"/>`
      );

      $("#choose-zone-title").text("請選擇區域");
      for (let i = 0; i < areasAndTicketPrices.length; i++) {
        const { concertArea, ticketPrice, totalSeats, concertAreaPriceId } =
          areasAndTicketPrices[i];

        if (parseInt(totalSeats) === 0) {
          $("#concert-zone-price-qty").append(
            `
            <li id='${concertAreaPriceId}' class ="area-list">
                <div class = "concert-zone-price-qty">${concertArea}  NT$${ticketPrice}   已無空座位可選</div>
            </li>
            `
          );
        } else {
          $("#concert-zone-price-qty").append(
            `
            <li id='${concertAreaPriceId}' class ="area-list">
                <a href="/order.html?concertId=${concertId}&concertDateId=${concertDateId}&concertAreaPriceId=${concertAreaPriceId}">
                <div class="concert-zone-price-qty" id = "${concertArea}">${concertArea} NT$${ticketPrice}   剩餘 ${totalSeats} 個空位</div>
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
