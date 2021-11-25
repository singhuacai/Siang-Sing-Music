$.ajax({
  url: "/api/1.0/concerts/campaigns",
  method: "GET",
  dataType: "json",
})
  .done(function (res) {
    $(function () {
      console.log(res);
      for (let i = 0; i < res.data.length; i++) {
        const data = res.data[i];
        const startDate = data.concertDatetime[0].split(" ")[0];
        const endDate =
          data.concertDatetime[data.concertDatetime.length - 1].split(" ")[0];

        let campaignHTML = `
        <a class="campaign" href="/campaign.html?id=${data.id}">
            <div class="campaign-image">
                <img src="${data.concertMainImage}" alt="campaign-main-image">
            </div>
            
            <div class="campaign_interval" >${startDate} ~ ${endDate}</div>
            <hr class="line-style" />
            <div class="campaign_title" >${data.concertTitle}</div>
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
