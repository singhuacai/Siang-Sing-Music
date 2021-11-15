require("dotenv").config();
const validator = require("validator");
const User = require("../models/user_model");

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password, phone } = req.body;

  /* ----------------- 初步驗證 ----------------- */

  if (!name || !email || !phone || !password) {
    res.status(400).send({
      error: "Request Error: name, email, phone and password are required.",
    });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "Request Error: Invalid email format" });
    return;
  }

  if (!validator.isMobilePhone(phone.toString())) {
    res
      .status(400)
      .send({ error: "Request Error: Invalid mobile phone format" });
    return;
  }

  if (!validator.isLength(phone.toString(), { min: 10 })) {
    res.status(400).send({ error: "Request Error: 您的手機號碼有漏打喔!" });
    return;
  }

  if (!validator.isLength(password, { min: 5 })) {
    res.status(400).send({ error: "Request Error: 密碼至少要5碼喔!" });
    return;
  }

  name = validator.escape(name);

  //TODO: signUp function

  const result = await User.signUp(
    name,
    User.role.USER,
    email,
    phone,
    password
  );
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: "Database Query Error" });
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      user_code: user.user_code,
      access_expired: user.access_expired,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
      },
    },
  });
};

const nativeSignIn = async (email, password) => {
  if (!email || !password) {
    res
      .status(400)
      .send({ error: "Request Error: email and password are required." });
    return;
  }
  try {
    return await User.nativeSignIn(email, password);
  } catch (error) {
    return { error };
  }
};

const signIn = async (req, res) => {
  const { provider } = req.body;

  let result;
  switch (provider) {
    case "native":
      const { email, password } = req.body;
      result = await nativeSignIn(email, password);
      break;
    // case "facebook":
    // const { access_token } = req.body;
    //   result = await facebookSignIn(access_token);
    //   break;
    default:
      result = { error: "Wrong Request" };
  }

  if (result.error) {
    const status_code = result.status ? result.status : 403;
    res.status(status_code).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ error: "Database Query Error" });
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      user_code: user.user_code,
      access_expired: user.access_expired,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
      },
    },
  });
};

const getUserProfile = async (req, res) => {
  const email = encodeEmail(req.user.email);
  const phone = encodePhone(req.user.phone);
  res.status(200).send({
    data: {
      provider: req.user.provider,
      name: req.user.name,
      email: email,
      phone: phone,
      picture: req.user.picture,
    },
  });
  return;
};

const encodeEmail = (email) => {
  const em = email.split("@");
  return `${em[0][0]}⁎⁎⁎⁎⁎⁎@${em[1]}`;
};

const encodePhone = (phone) => {
  console.log(phone);
  const ph = phone.replace(/(\d{3})\d{4}(\d{3})/, "$1⁎⁎⁎⁎$2");
  console.log(`ph:${ph}`);
  return ph;
};

module.exports = {
  signUp,
  signIn,
  getUserProfile,
  // getUserOrders,
  // postUserCancelOrder,
  // postUserComment,
};
