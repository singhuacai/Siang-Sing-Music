const concert_id = window.location.search.split("?id=")[1];
let Authorization = localStorage.getItem("Authorization");
const currency = "NT$";

const rewiteTicketPrices = (ticketPricesArray) => {
  return ticketPricesArray
    .map((money) => {
      return currency + money;
    })
    .join("、");
};

$.ajax({
  url: `/api/1.0/concerts/details?id=${concert_id}`,
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      $(".main-image").css(
        "background-image",
        "url(" + res.data.concert_main_image + ")"
      );

      $("#concert_title").text(`${res.data.concert_title}`);
      $("#concert_story").html(`<p>${res.data.concert_story}</p>`);
      $("#concert_sold_time").text(
        `${res.data.sold_start} ~ ${res.data.sold_end}`
      );
      $("#notice").html(`<p>${res.data.notice}</p>`);
      for (let i = 0; i < res.data.concert_info.length; i++) {
        const ticket_prices = rewiteTicketPrices(
          res.data.concert_info[i].ticket_prices
        );

        $("#date_location_price").append(
          `
        <tr>
          <td>${res.data.concert_info[i].concert_datetime}</td>
          <td style="word-wrap:break-word;">${res.data.concert_location}</td>
          <td>${ticket_prices}</td>
          <td><button class = "booking-button" onclick = "javascript:location.href='/order.html?concertId=${concert_id}&concertDateId=${res.data.concert_info[i].concert_date_id}'">立即訂購</button></td>
        </tr>
        `
        );
      }
    });
  })
  .fail(function (res) {
    alert(`Error: ${res.responseText}.`);
  });
