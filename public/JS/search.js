$.ajax({
  url: `/api/1.0/concerts/search?keyword=${keyword}`,
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      console.log(res);
      for (let i = 0; i < res.data.length; i++) {
        const start_date = res.data[i].concert_datetime[0].split(" ")[0];
        const end_date =
          res.data[i].concert_datetime[
            res.data[i].concert_datetime.length - 1
          ].split(" ")[0];

        let campaignHTML = `
          <a class="campaign" href="/campaign.html?id=${res.data[i].id}">
              <div class="campaign-image">
                  <img src="${res.data[i].concert_main_image}" alt="campaign-main-image">
              </div>
              <div class="campaign_interval" >${start_date} ~ ${end_date}</div>
              <hr class="line-style" />
              <div class="campaign_title" >${res.data[i].concert_title}</div>
          </a>
          `;

        $("#campaigns").append(campaignHTML);
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
