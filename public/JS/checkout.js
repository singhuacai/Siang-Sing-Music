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

$("#submit").click(async () => {
  // 1. 確認有 token
  if (!Authorization) {
    Swal.fire({
      title: "No token",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }

  // 2. 確認收件人資料均有填寫
  const recipientName = $("#recipient-name").val();
  const recipientPhone = $("#recipient-phone").val();
  const recipientAddrZip = $(".recipient-addr-zip").val();
  const recipientAddrCounty = $(".recipient-addr-county").val();
  const recipientAddrArea = $(".recipient-addr-area").val();
  const recipientAddress =
    $(".recipient-addr-zip").val() +
    $(".recipient-addr-county").val() +
    $(".recipient-addr-area").val() +
    $("#recipient-detail-address").val();

  // const ordererName = $("#orderer-name").val();
  // const ordererPhone = $("#orderer-phone").val();
  // const ordererEmail = $("#orderer-email").val();

  // 未填寫收件人資訊 => alert!
  if (!recipientName) {
    Swal.fire({
      title: "您未填寫收件人姓名",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }
  if (!recipientPhone) {
    Swal.fire({
      title: "您未填寫收件人手機",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }
  if (
    !recipientAddress ||
    !recipientAddrZip ||
    !recipientAddrCounty ||
    !recipientAddrArea
  ) {
    Swal.fire({
      title: "您的收件地址填寫不完全",
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }

  // 3. 確認信用卡資訊均有填寫 => alert 錯誤訊息
  if (!canGetPrime()) {
    Swal.fire({
      title: cannotGetPrimeReason(),
      icon: "error",
      showConfirmButton: false,
      timer: 1000,
    });
    return;
  }

  // 4. 確認信用卡是可用的(有prime)
  const prime = await getPrime();
  console.log("prime:", prime);

  // 5. 取得購物車中所有座位的 shoppingCartId => 將它存到 shoppingCartSeat Array 中
  let shoppingCartSeat = [];
  $(".cart-item").each(function () {
    shoppingCartSeat.push(
      parseInt(
        $(this)
          .attr("id")
          .replace(/item-of-cart-/, "")
      )
    );
  });

  // 6. 整理即將送出的訂單資訊(data)
  const freight = 50;
  const data = {
    prime,
    order: {
      shipping: "mail-deliver",
      payment: "credit_card",
      subtotal: parseInt($(".price-sum").text().split("NT$")[1]),
      freight,
      total: parseInt($(".price-sum").text().split("NT$")[1]) + freight,
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        address: recipientAddress,
      },
      shoppingCartSeat,
    },
  };
  $.ajax({
    url: `/api/1.0/order/checkout`,
    data: JSON.stringify({ data }),
    method: "POST",
    dataType: "json",
    headers: {
      Authorization: `Bearer ${Authorization}`,
      "Content-type": "application/json",
    },
    beforeSend: function () {
      if (data) {
        Swal.fire({
          title: "結帳中，請勿離開此頁...",
          position: "center",
          icon: "info",
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    },
  })
    .done(function (res) {
      $(function () {
        Swal.close();
        const mainOrderCode = res.mainOrderCode;
        window.location.assign(`/thankyou.html?number=${mainOrderCode}`);
      });
    })
    .fail(function (res) {
      Swal.fire({
        title: JSON.parse(res.responseText).error,
        icon: "error",
        showConfirmButton: false,
        timer: 1000,
      });
    });
});

function getPrime() {
  return new Promise((resolve, reject) => {
    TPDirect.card.getPrime((result) => {
      if (result.status === 0) {
        resolve(result.card.prime);
      } else {
        reject(result);
      }
    });
  });
}

function canGetPrime() {
  return TPDirect.card.getTappayFieldsStatus().canGetPrime;
}

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
