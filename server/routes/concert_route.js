const router = require("express").Router();
const { wrapAsync } = require("../../util/util");
const { getCampaigns } = require("../controllers/concert_controller");

router.route("/concerts/campaigns").get(wrapAsync(getCampaigns));
module.exports = router;
