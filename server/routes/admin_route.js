const router = require("express").Router();
const { wrapAsync } = require("../../util/util");
const { createConcert } = require("../controllers/concert_controller");

router
  .route("/admin/concert")
  .post(/*authentication(USER_ROLE.ADMIN), */ wrapAsync(createConcert));

module.exports = router;
