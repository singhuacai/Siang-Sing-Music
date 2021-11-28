const { requester } = require("./set_up");
const { closeConnection } = require("./fake_data_generator");

after(async () => {
  await closeConnection();
  requester.close();
});
