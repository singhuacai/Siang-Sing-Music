const path = require("path");
require("dotenv").config();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const auth = {
  user: process.env.EMAIL_AUTH_USER,
  pass: process.env.EMAIL_AUTH_PASS,
};

const Mail_Type = {
  FinishOrder: 1,
  SignUpValify: 2,
};

const send_email = async (send_info, mail_type) => {
  const {
    userName,
    userEmail,
    buyTime,
    orderCode,
    orderStatus,
    shipping,
    subtotal,
    freight,
    total,
    recipientName,
    recipientPhone,
    recipientAddress,
  } = send_info;

  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: auth,
  });

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./public/views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./public/views/"),
  };

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  // TODO 1: 依信件類型，取得信件標題跟內容模板
  switch (mail_type) {
    case Mail_Type.FinishOrder:
      title = "購買完成通知信";
      template = "finishOrder";
      break;
    case Mail_Type.SignUpValify:
      title = "註冊驗證通知信";
      template = "finishOrder"; // TODO: 待修改
      break;
  }

  // TODO 2: 置換對應類型信件需要的參數內容
  let mailOptions = {
    from: "no-reply@gmail.com",
    to: userEmail,
    subject: title,
    template: template,
    context: {
      userName: userName,
      buyTime: buyTime,
      orderCode: orderCode,
      orderStatus: orderStatus,
      shipping: shipping,
      subtotal: subtotal,
      freight: freight,
      total: total,
      payment: "信用卡",
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      recipientAddress: recipientAddress,
    },
  };

  // trigger the sending of the E-mail
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error " + error);
    } else {
      console.log("Email sent: " + info.response);
    }
    console.log(info);
  });
};

module.exports = {
  send_email,
  Mail_Type,
};
