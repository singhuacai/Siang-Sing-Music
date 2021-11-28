const router = require("express").Router();
const { ROLE } = require("../models/user_model");
const { wrapAsync, authentication } = require("../../util/util");
const { createConcert } = require("../controllers/concert_controller");

router.route("/admin/concert").post(authentication(ROLE.ADMIN), wrapAsync(createConcert));

module.exports = router;
