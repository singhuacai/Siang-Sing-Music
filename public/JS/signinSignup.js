function signUp() {
  const name = $("#name_signup").val();
  const email = $("#email_signup").val();
  const phone = $("#phone_signup").val();
  const password = $("#password_signup").val();

  if (!name || !email || !phone || !password) {
    Swal.fire({
      title: "Name, Email, Phone and Password are required!",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }
  $.ajax({
    url: "/api/1.0/user/signup",
    data: JSON.stringify({ name, email, phone, password }),
    method: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
  })
    .done(function (res) {
      $(function () {
        localStorage.setItem("Authorization", res.data.access_token);
        localStorage.setItem("UserCode", res.data.user_code);
        window.location.assign("/profile.html");
      });
    })
    .fail(function (res) {
      Swal.fire({
        title: JSON.parse(res.responseText).error,
        icon: "error",
        width: "600px",
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

function signIn() {
  const email = $("#email_signin").val();
  const password = $("#password_signin").val();

  if (!email || !password) {
    Swal.fire({
      title: "Email and Password are required!",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }
  $.ajax({
    url: "/api/1.0/user/signin",
    data: JSON.stringify({ provider: "native", email, password }),
    method: "POST",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
  })
    .done(function (res) {
      $(function () {
        localStorage.setItem("Authorization", res.data.access_token);
        localStorage.setItem("UserCode", res.data.user_code);
        window.location.assign("/profile.html");
      });
    })
    .fail(function (res) {
      Swal.fire({
        title: JSON.parse(res.responseText).error,
        icon: "error",
        width: "600px",
        showConfirmButton: false,
        timer: 1000,
      });
    });
}

function logOut() {
  localStorage.removeItem("Authorization");
  localStorage.removeItem("UserCode");
  window.location.assign("/profile.html");
}

function ShowSignUp() {
  $("#formSignUp").show();
  $("#formSignIn").hide();
  $("#add-signup-block").hide();
  $("#add-signin-block").show();
}

function ShowSignIn() {
  $("#formSignIn").show();
  $("#formSignUp").hide();
  $("#add-signin-block").hide();
  $("#add-signup-block").show();
}

function ShowSignUpPass() {
  if ($("#password_signup").attr("type") === "password") {
    $("#password_signup").attr("type", "text");
  } else {
    $("#password_signup").attr("type", "password");
  }
}

function ShowSignInPass() {
  if ($("#password_signin").attr("type") === "password") {
    $("#password_signin").attr("type", "text");
  } else {
    $("#password_signin").attr("type", "password");
  }
}
