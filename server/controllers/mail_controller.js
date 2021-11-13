const nodemailer = require("nodemailer");
const auth = {
  user: process.env.EMAIL_AUTH_USER,
  pass: process.env.EMAIL_AUTH_PASS,
};
const Mail_Type = {
  FinishOrder: 1,
  SignUpValify: 2,
};

const send_email = async (to_user, mail_type) => {
  // TODO 1: From DB 取得 信件標題跟內容模板
  switch (mail_type) {
    case Mail_Type.FinishOrder:
      title = "購買完成通知信";
      content = "<p>Hello {{name}}</p>";
      break;
    case Mail_Type.SignUpValify:
      title = "註冊驗證通知信";
      content = "<p>Hello</p>";
      break;
  }
  // TODO 2: 置換對應類型信件需要的參數內容
  name = "Tom";
  content = content.replace("{{name}}", name);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: auth,
  });

  let mailOptions = {
    // from: "no-reply@gmail.com",
    to: to_user,
    subject: title,
    html: content,
  };

  const result = await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error " + error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  console.log(result);
};

module.exports = {
  send_email,
  Mail_Type,
};

/*
0. controller
1. DB table 
2. 信件 html
3. mvc

*/
