const appId = 12348;
const appKey =
  "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF";
const serverType = "sandbox";

function setupSdk() {
  TPDirect.setupSDK(appId, appKey, serverType);
}

function setupCard() {
  TPDirect.card.setup({
    fields: {
      number: {
        element: "#card-number",
        placeholder: "**** **** **** ****",
      },
      expirationDate: {
        element: "#card-expiration-date",
        placeholder: "MM / YY",
      },
      ccv: {
        element: "#card-ccv",
        placeholder: "後三碼",
      },
    },
    styles: {
      input: {
        color: "gray",
      },
      "input.ccv": {
        "font-size": "16px",
      },
      "input.expiration-date": {
        "font-size": "16px",
      },
      "input.card-number": {
        "font-size": "16px",
      },
      ":focus": {
        color: "black",
      },
      ".valid": {
        color: "green",
      },
      ".invalid": {
        color: "red",
      },
    },
  });
}

setupSdk();
setupCard();

// 取得訂購之會員的基本資料
$.ajax({
  url: `/api/1.0/user/profile`,
  method: "GET",
  dataType: "json",
  headers: { Authorization: `Bearer ${Authorization}` },
})
  .done(function (res) {
    console.log(res);
    $(function () {
      $("#orderer-name").text(`姓名 : ${res.data.name}`);
      $("#orderer-phone").text(`手機 : ${res.data.phone}`);
      $("#orderer-email").text(`電子郵件 : ${res.data.email}`);
    });
  })
  .fail(function (res) {
    alert(`Error: ${res.responseText}.`);
    window.location.assign("/profile.html");
  });

$("#submit").click(() => {
  // 1. 確認收件人資料均有填寫
  const recipientName = $("#recipient-name").val();
  const recipientPhone = $("#recipient-phone").val();
  const recipientAddress =
    $(".recipient-addr-zip").val() +
    $(".recipient-addr-county").val() +
    $(".recipient-addr-area").val() +
    $("#recipient-detail-address").val();

  const ordererName = $("#orderer-name").val();
  const ordererPhone = $("#orderer-phone").val();
  const ordererEmail = $("#orderer-email").val();

  // 2. 確認信用卡是可用的(有prime)
  function getPrime() {
    return new Promise((resolve) => {
      window.TPDirect.card.getPrime((result) => {
        if (result.status === 0) {
          resolve(result.card.prime);
          alert(result.card.prime);
        } else {
          alert(`CAN'T GET PRIME`);
        }
      });
    });
  }
  getPrime(); // prime

  function canGetPrime() {
    return TPDirect.card.getTappayFieldsStatus().canGetPrime;
  }

  alert(canGetPrime()); // true ot false

  function cannotGetPrimeReason() {
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    if (tappayStatus.status.number === 1) {
      return "請輸入信用卡號碼";
    }
    if (tappayStatus.status.number === 2) {
      return "信用卡號碼有誤";
    }
    if (tappayStatus.status.expiry === 1) {
      return "請輸入有效期限";
    }
    if (tappayStatus.status.expiry === 2) {
      return "有效期限有誤";
    }
    if (tappayStatus.status.ccv === 1) {
      return "請輸入安全碼";
    }
    if (tappayStatus.status.ccv === 2) {
      return "安全碼有誤";
    }
    return undefined;
  }

  alert(cannotGetPrimeReason()); // 有錯 => alert
});
