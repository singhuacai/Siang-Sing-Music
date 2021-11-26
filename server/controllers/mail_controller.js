const path = require("path");
require("dotenv").config();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const auth = {
  user: process.env.EMAIL_AUTH_USER,
  pass: process.env.EMAIL_AUTH_PASS,
};

const MAIL_TYPE = {
  FinishOrder: 1,
  SignUpValify: 2,
};

const sendEmail = async (sendInfo, mailType) => {
  const {
    ordererName,
    ordererEmail,
    orderTime,
    mainOrderCode,
    orderStatus,
    shipping,
    subtotal,
    freight,
    total,
    recipientName,
    recipientPhone,
    recipientAddress,
  } = sendInfo;

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

  // According to the letter type, get the letter title and content template
  switch (mailType) {
    case MAIL_TYPE.FinishOrder:
      title = "購買完成通知信";
      template = "finishOrder";
      break;
    case MAIL_TYPE.SignUpValify:
      title = "註冊驗證通知信";
      template = "finishOrder"; // TODO: 待修改
      break;
  }

  // Replace the parameter required by the corresponding type of letter
  let mailOptions = {
    from: "no-reply@gmail.com",
    to: ordererEmail,
    subject: title,
    template: template,
    context: {
      ordererName: ordererName,
      orderTime: orderTime,
      orderCode: mainOrderCode,
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
  });
};

module.exports = {
  sendEmail,
  MAIL_TYPE,
};
