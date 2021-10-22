function signUp() {
  const name = $("#name_signup").val();
  const email = $("#email_signup").val();
  const phone = $("#phone_signup").val();
  const password = $("#password_signup").val();

  $.ajax({
    url: "/api/1.0/user/signup",
    data: JSON.stringify({ name, email, phone, password }),
    method: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
  })
    .done(function (res) {
      $(function () {
        console.log(res);
        localStorage.setItem("Authorization", res.data.access_token);
        window.location.assign("/profile.html");
      });
    })
    .fail(function (res) {
      alert(`Error: ${res.responseText}.`);
      window.location.assign("/profile.html");
    });
}

function signIn() {
  const email = $("#email_signin").val();
  const password = $("#password_signin").val();

  $.ajax({
    url: "/api/1.0/user/signin",
    data: JSON.stringify({ provider: "native", email, password }),
    method: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
  })
    .done(function (res) {
      $(function () {
        console.log(res);
        localStorage.setItem("Authorization", res.data.access_token);
        window.location.assign("/profile.html");
      });
    })
    .fail(function (res) {
      alert(`Error: ${res.responseText}.`);
      window.location.assign("/profile.html");
    });
}

function logOut() {
  localStorage.removeItem("Authorization");
  window.location.assign("/profile.html");
}
