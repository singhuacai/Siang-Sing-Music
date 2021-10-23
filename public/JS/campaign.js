const concert_id = window.location.search.split("?id=")[1];
var Authorization = localStorage.getItem("Authorization");

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
      $("#notice").html(`<p>${res.data.notice}</p>`);
      for (let i = 0; i < res.data.concert_info.length; i++) {
        $("#date_location_price").append(
          `
        <tr>
        <td>${res.data.concert_info[i].concert_datetime}</td>
        <td>${res.data.concert_location}</td>
        <td>${res.data.concert_info[i].ticket_prices}</td>
        <td><button class = "booking-button" onclick = "myFunction('${concert_id}','${res.data.concert_info[i].concert_datetime}','${Authorization}')">立即訂購</button></td>
        </tr>
        `
        );

        // $(
        //   `#${concert_id}_${res.data.concert_info[i].concert_datetime}`
        // ).onclick = function () {
        //   "javascript:location.href='/api/1.0/order/performanceAndAreas?concertId=${concert_id}&datetime=${res.data.concert_info[i].concert_datetime}'";
        // };
      }
    });
  })
  .fail(function (res) {
    alert(`Error: ${res.responseText}.`);
  });

function myFunction(concert_id, datetime, Authorization) {
  console.log(concert_id);
  console.log(datetime);
  console.log(Authorization);
  //
}
