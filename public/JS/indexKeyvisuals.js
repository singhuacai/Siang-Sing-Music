$.ajax({
  url: "/api/1.0/concerts/keyvisuals",
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      $(".carousel-inner").append(
        `
        <div class="carousel-item active">
        <a href='/campaign.html?id=${res.data[0].concertId}'><img src="${res.data[0].concertMainImage}" class="d-block "/></a>
        </div>
        `
      );
      for (let i = 1; i < res.data.length; i++) {
        $(".carousel-inner").append(
          `
          <div class="carousel-item">
          <a href='/campaign.html?id=${res.data[i].concertId}'><img src="${res.data[i].concertMainImage}" class="d-block"/></a>
          </div>
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
