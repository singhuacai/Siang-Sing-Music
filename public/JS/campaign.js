const product_id = window.location.search.split("?id=")[1];

$.ajax({
  url: `/api/1.0/concerts/details?id=${product_id}`,
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      console.log(res.data.concert_main_image);
      $(".main-image").css(
        "background-image",
        "url(" + res.data.concert_main_image + ")"
      );

      $("#concert_title").text(`${res.data.concert_title}`);
      $("#concert_story").html(`<p>${res.data.concert_story}</p>`);
      $("#notice").html(`<p>${res.data.notice}</p>`);
      for (let i = 0; i < res.data.concert_info.length; i++) {
        $("#date_location_price").append(
          `
        <tr>
        <td>${res.data.concert_info[i].concert_datetime}</td>
        <td>${res.data.concert_location}</td>
        <td>${res.data.concert_info[i].ticket_prices}</td>
        <td><button class = "booking-button" onclick="myFunction()">立即訂購</button></td>
        </tr>
        `
        );
      }
    });
  })
  .fail(function (res) {
    alert(`Error: ${res.responseText}.`);
  });
