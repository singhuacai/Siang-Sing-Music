$(function () {
  $("#twzipcode").twzipcode({
    css: ["recipient-addr-county", "recipient-addr-area", "recipient-addr-zip"],
  });
});

$.ajax({
  url: `/api/1.0/user/profile`,
  method: "GET",
  dataType: "json",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    $(function () {
      $("#orderer-name").text(`姓名 : ${res.data.name}`);
      $("#orderer-phone").text(`手機 : ${res.data.phone}`);
      $("#orderer-email").text(`電子郵件 : ${res.data.email}`);
    });
  })
  .fail(function (res) {
    Swal.fire({
      title: "請先登入",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    }).then(function () {
      window.location = "/profile.html";
    });
  });
