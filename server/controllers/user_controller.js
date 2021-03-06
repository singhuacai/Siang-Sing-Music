const validator = require("validator");
const User = require("../models/user_model");

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password, phone } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400).send({
      error: "您的資料填寫不完全，請再檢查一下",
    });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: "email的格式有誤" });
    return;
  }

  if (!validator.isMobilePhone(phone.toString())) {
    res.status(400).send({ error: "手機號碼的格式有誤" });
    return;
  }

  if (!validator.isLength(phone.toString(), { min: 10 })) {
    res.status(400).send({ error: "您的手機號碼有漏打喔!" });
    return;
  }

  if (!validator.isLength(password, { min: 5 })) {
    res.status(400).send({ error: "密碼至少要5碼喔!" });
    return;
  }

  name = validator.escape(name);

  const result = await User.signUp(name, User.ROLE.USER, email, phone, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    return res.status(500);
  }

  return res.status(200).send({
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
    return { status: 400, error: "您的資料填寫不完全，請再檢查一下" };
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
    res.status(500);
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
  return res.status(200).send({
    data: {
      provider: req.user.provider,
      name: req.user.name,
      email: email,
      phone: phone,
      picture: req.user.picture,
    },
  });
};

const encodeEmail = (email) => {
  const em = email.split("@");
  return `${em[0][0]}⁎⁎⁎⁎⁎⁎@${em[1]}`;
};

const encodePhone = (phone) => {
  const ph = phone.replace(/(\d{3})\d{4}(\d{3})/, "$1⁎⁎⁎⁎$2");
  return ph;
};

module.exports = {
  signUp,
  signIn,
  getUserProfile,
};
