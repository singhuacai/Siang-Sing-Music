const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { NODE_ENV } = process.env;
chai.use(chaiHttp);

const assert = chai.assert;
const expect = chai.expect;
const requester = chai.request(app).keepOpen();

before(async () => {
  if (NODE_ENV !== "test") {
    throw "Not in test env";
  }
});

module.exports = {
  assert,
  expect,
  requester,
};
