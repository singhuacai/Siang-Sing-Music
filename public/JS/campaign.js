const concertId = window.location.search.split("?id=")[1];
const Authorization = localStorage.getItem("Authorization");
const currency = "NT$";

const rewiteTicketPrices = (ticketPricesArray) => {
  return ticketPricesArray
    .map((money) => {
      return currency + money;
    })
    .join("、");
};

$.ajax({
  url: `/api/1.0/concerts/details?id=${concertId}`,
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      $(".main-image").css(
        "background-image",
        "url(" + res.data.concertMainImage + ")"
      );

      $("#concert-title").text(`${res.data.concertTitle}`);
      $("#concert-story").html(`<p>${res.data.concertStory}</p>`);
      $("#concert-sold-time").text(
        `${res.data.soldStart} ~ ${res.data.soldEnd}`
      );
      $("#notice").html(`<p>${res.data.notice}</p>`);
      for (let i = 0; i < res.data.concertInfo.length; i++) {
        const ticketPrices = rewiteTicketPrices(
          res.data.concertInfo[i].ticketPrices
        );

        $("#date_location_price").append(
          `
        <tr>
          <td>${res.data.concertInfo[i].concertDatetime}</td>
          <td style="word-wrap:break-word;">${res.data.concertLocation}</td>
          <td>${ticketPrices}</td>
          <td><button class = "booking-button" onclick = "javascript:location.href='/order.html?concertId=${concertId}&concertDateId=${res.data.concertInfo[i].concertDateId}'">立即訂購</button></td>
        </tr>
        `
        );
      }
    });
  })
  .fail(function (res) {
    Swal.fire({
      title: JSON.parse(res.responseText).error,
      icon: "error",
      showConfirmButton: false,
      timer: 1200,
    }).then(function () {
      window.location = "/";
    });
  });
