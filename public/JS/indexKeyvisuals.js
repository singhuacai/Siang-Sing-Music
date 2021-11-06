$.ajax({
    url: "/api/1.0/concerts/keyvisuals",
    method: "GET",
    dataType: "json",
})
    .done(function (res) {
        $(function () {
            console.log(res);
            $(".keyvisual").attr("href", `/campaign.html?id=${res.data[0].concert_id}`);
            $(".keyvisual").css("background-image", "url(" + res.data[0].concert_main_image + ")");
        });
    })
    .fail(function (res) {
        alert(`Error: ${res.responseText}.`);
    });
