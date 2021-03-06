const { pool } = require("./mysql");
const bcrypt = require("bcrypt");
const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env;
const jwt = require("jsonwebtoken");

const ROLE = {
  ALL: -1,
  ADMIN: 1,
  USER: 2,
};

const getUserCode = () => {
  const random_array = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  const i = Math.floor(Math.random() * 36);
  const j = Math.floor(Math.random() * 36);
  const now = new Date();
  return (
    random_array[i] + random_array[j] + +now.getMonth() + now.getDate() + (now.getTime() % (24 * 60 * 60 * 1000)) + Math.floor(Math.random() * 10)
  );
};

const signUp = async (name, roleId, email, phone, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const emails = await conn.query("SELECT email FROM user WHERE email = ? FOR UPDATE", [email]);
    if (emails[0].length > 0) {
      await conn.query("COMMIT");
      return { error: "此 Email 已被註冊過" };
    }

    const loginAt = new Date();
    const user = {
      user_code: getUserCode(),
      provider: "native",
      role_id: roleId,
      email: email,
      phone: phone,
      password: bcrypt.hashSync(password, salt),
      name: name,
      picture: "/images/profile/default_user_profile.png",
      access_expired: TOKEN_EXPIRE,
      login_at: loginAt,
    };
    const accessToken = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
        expiresIn: TOKEN_EXPIRE,
      },
      TOKEN_SECRET
    );
    user.access_token = accessToken;

    const queryStr = "INSERT INTO user SET ?";
    const [result] = await conn.query(queryStr, user);

    user.id = result.insertId;
    await conn.query("COMMIT");
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const nativeSignIn = async (email, password) => {
  const conn = await pool.getConnection();
  if (!email || !password) {
    return { error: "您的資料填寫不完全，請再檢查一下" };
  }
  try {
    await conn.query("START TRANSACTION");
    const users = await conn.query("SELECT *, count(*) AS count FROM user WHERE email = ?", [email]);
    const user = users[0][0];
    if (user.count === 0) {
      return { error: "您尚未註冊!" };
    }

    if (!bcrypt.compareSync(password, user.password)) {
      await conn.query("COMMIT");
      return { error: "密碼有誤" };
    }

    const loginAt = new Date();
    const accessToken = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
        expiresIn: TOKEN_EXPIRE,
      },
      TOKEN_SECRET
    );

    const queryStr = "UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?";
    await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);

    await conn.query("COMMIT");

    user.access_token = accessToken;
    user.login_at = loginAt;
    user.access_expired = TOKEN_EXPIRE;

    return { user };
  } catch (error) {
    console.log(`error in nativeSignIn: ${error}`);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const getUserDetail = async (email, roleId) => {
  try {
    if (roleId) {
      const [users] = await pool.query("SELECT * FROM user WHERE email = ? AND role_id = ?", [email, roleId]);
      return users[0];
    } else {
      const [users] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
      return users[0];
    }
  } catch (e) {
    return null;
  }
};

module.exports = {
  ROLE,
  signUp,
  nativeSignIn,
  getUserDetail,
};
