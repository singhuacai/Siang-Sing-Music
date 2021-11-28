require("dotenv").config();
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");
const { pool } = require("../server/models/mysql");
const expectedExpireTime = process.env.TOKEN_EXPIRE;

describe("user", () => {
  /* sign up */
  it("sign up with correct input", async () => {
    const user = {
      name: "singhua",
      phone: "0912345678",
      email: "singhua@gmail.com",
      password: "password",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);

    const data = res.body.data;

    const userExpected = {
      id: data.user.id, // need id from returned data
      provider: "native",
      name: user.name,
      phone: user.phone,
      email: user.email,
      picture: data.user.picture, // need picture from returned data
    };

    expect(data.user).to.deep.equal(userExpected);
    expect(data.access_token).to.be.a("string");
    expect(data.access_expired).to.equal(expectedExpireTime);
    expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 2500);
  });

  it("sign up without name or phone or email or password", async () => {
    const user1 = {
      phone: "0912345678",
      email: "singhua@gmail.com",
      password: "password",
    };

    const res1 = await requester.post("/api/1.0/user/signup").send(user1);
    expect(res1.statusCode).to.equal(400);

    const user2 = {
      name: "singhua",
      email: "singhua@gmail.com",
      password: "password",
    };

    const res2 = await requester.post("/api/1.0/user/signup").send(user2);
    expect(res2.statusCode).to.equal(400);

    const user3 = {
      name: "singhua",
      phone: "0912345678",
      password: "password",
    };

    const res3 = await requester.post("/api/1.0/user/signup").send(user3);
    expect(res3.statusCode).to.equal(400);

    const user4 = {
      name: "singhua",
      phone: "0912345678",
      email: "singhua@gmail.com",
    };

    const res4 = await requester.post("/api/1.0/user/signup").send(user4);
    expect(res4.statusCode).to.equal(400);
  });

  it("sign up with existed email", async () => {
    const user = {
      name: "singhua",
      email: users[0].email,
      phone: "0912345678",
      password: "password",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);
    expect(res.body.error).to.equal("此 Email 已被註冊過");
  });

  it("sign up with malicious email", async () => {
    const user = {
      name: "singhua",
      email: `<script>alert("Hello World")</script>`,
      phone: "0912345678",
      password: "password",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);
    expect(res.body.error).to.equal("email的格式有誤");
  });

  it("sign up with Invalid email format", async () => {
    const user1 = {
      name: "singhua",
      email: "singhua",
      phone: "0912345678",
      password: "password",
    };

    const res1 = await requester.post("/api/1.0/user/signup").send(user1);
    expect(res1.body.error).to.equal("email的格式有誤");

    const user2 = {
      name: "singhua",
      email: "singhua@",
      phone: "0912345678",
      password: "password",
    };

    const res2 = await requester.post("/api/1.0/user/signup").send(user2);
    expect(res2.body.error).to.equal("email的格式有誤");

    const user3 = {
      name: "singhua",
      email: "singhua@gmail",
      phone: "0912345678",
      password: "password",
    };

    const res3 = await requester.post("/api/1.0/user/signup").send(user3);
    expect(res3.body.error).to.equal("email的格式有誤");
  });

  it("sign up with Invalid phone format", async () => {
    const user = {
      name: "singhua",
      email: "singhua@gmail.com",
      phone: "0912",
      password: "password",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);
    expect(res.body.error).to.equal("您的手機號碼有漏打喔!");
  });

  it("sign up with Invalid password format", async () => {
    const user = {
      name: "singhua",
      email: "singhua@gmail.com",
      phone: "0912345678",
      password: "1111",
    };

    const res = await requester.post("/api/1.0/user/signup").send(user);
    expect(res.body.error).to.equal("密碼至少要5碼喔!");
  });

  /* sign in */
  it("sign in with correct password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res = await requester.post("/api/1.0/user/signin").send(user);

    const data = res.body.data;

    const userExpected = {
      id: data.user.id, // need id from returned data
      provider: user.provider,
      name: user1.name,
      phone: user1.phone,
      email: user.email,
      picture: data.user.picture, // need picture from returned data
    };

    expect(data.user).to.deep.equal(userExpected);
    expect(data.access_token).to.be.a("string");
    expect(data.access_expired).to.equal(expectedExpireTime);

    // make sure DB is changed, too
    const loginTime = await pool.query("SELECT login_at FROM user WHERE email = ?", [user.email]);

    expect(new Date(data.login_at).getTime()).to.closeTo(Date.now(), 2500);
    expect(new Date(loginTime[0][0].login_at).getTime()).to.closeTo(Date.now(), 2500);
  });

  it("sign in without provider", async () => {
    const user1 = users[0];
    const userNoProvider = {
      email: user1.email,
      password: user1.password,
    };

    const res = await requester.post("/api/1.0/user/signin").send(userNoProvider);

    expect(res.body.error).to.equal("Wrong Request");
  });

  it("sign in without email or password", async () => {
    const user1 = users[0];
    const userNoEmail = {
      provider: user1.provider,
      password: user1.password,
    };

    const res1 = await requester.post("/api/1.0/user/signin").send(userNoEmail);

    expect(res1.status).to.equal(400);
    expect(res1.body.error).to.equal("您的資料填寫不完全，請再檢查一下");

    const userNoPassword = {
      provider: user1.provider,
      email: user1.email,
    };

    const res2 = await requester.post("/api/1.0/user/signin").send(userNoPassword);

    expect(res2.status).to.equal(400);
    expect(res2.body.error).to.equal("您的資料填寫不完全，請再檢查一下");
  });

  it("sign in with wrong password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: "wrong password",
    };

    const res = await requester.post("/api/1.0/user/signin").send(user);

    expect(res.status).to.equal(403);
    expect(res.body.error).to.equal("密碼有誤");
  });

  it("sign in with malicious password", async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: '" OR 1=1; -- ',
    };

    const res = await requester.post("/api/1.0/user/signin").send(user);

    expect(res.status).to.equal(403);
    expect(res.body.error).to.equal("密碼有誤");
  });
});
