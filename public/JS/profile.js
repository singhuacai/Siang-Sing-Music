let Authorization = localStorage.getItem("Authorization");

$.ajax({
    url: `/api/1.0/user/profile`,
    method: "GET",
    dataType: "json",
    headers: { Authorization: `Bearer ${Authorization}` },
})
    .done(function (res) {
        console.log(res);
        $(function () {
            $("#userform").show();
            $("#profile_image").show();
            $("#user_name").show();
            $("#user_email").show();
            $("#log-out").show();
            $("#userform").text("會員資料");
            $("#profile_image").attr("src", `${res.data.picture}`);
            $("#user_name").text(`name: ${res.data.name}`);
            $("#user_email").text(`email: ${res.data.email}`);
            $("#user_phone").text(`phone: ${res.data.phone}`);
        });
    })
    .fail(function (res) {
        $("#formSignUp").show();
        $("#formSignIn").show();
    });
