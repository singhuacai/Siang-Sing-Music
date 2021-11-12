$.ajax({
  url: "/api/1.0/concerts/keyvisuals",
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      console.log(res);
      $(".carousel-inner").append(
        `
        <div class="carousel-item active">
        <a href='/campaign.html?id=${res.data[0].concert_id}'><img src="${res.data[0].concert_main_image}" class="d-block "/></a>
        </div>
        `
      );
      for (let i = 1; i < res.data.length; i++) {
        $(".carousel-inner").append(
          `
          <div class="carousel-item">
          <a href='/campaign.html?id=${res.data[0].concert_id}'><img src="${res.data[i].concert_main_image}" class="d-block"/></a>
          </div>
          `
        );
      }
    });
  })
  .fail(function (res) {
    alert(`Error: ${res.responseText}.`);
  });
