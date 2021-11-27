const Authorization = localStorage.getItem("Authorization");

$.ajax({
  url: `/api/1.0/user/profile`,
  method: "GET",
  dataType: "json",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    console.log(res);
    $(function () {
      $("#add-signin-block").hide();
      $("#add-signup-block").hide();
      $("#formSignIn").hide();
      $("#userform").show();
      $("#profile_image").show();
      $("#user_name").show();
      $("#user_email").show();
      $("#log-out").show();
      $("#userform").text("會員資料");
      $("#profile_image").attr("src", `${res.data.picture}`);
      $("#user_name").text(`會員姓名: ${res.data.name}`);
      $("#user_phone").text(`手機號碼: ${res.data.phone}`);
      $("#user_email").text(`電子郵件: ${res.data.email}`);
    });
  })
  .fail(function (res) {
    $("#formSignIn").show();
    $("#add-signin-block").hide();
  });
