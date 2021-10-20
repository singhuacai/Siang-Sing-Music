const router = require("express").Router();
const { wrapAsync } = require("../../util/util");
const {
  getCampaigns,
  getKeyvisuals,
} = require("../controllers/concert_controller");

router.route("/concerts/campaigns").get(wrapAsync(getCampaigns));
router.route("/concerts/keyvisuals").get(wrapAsync(getKeyvisuals));

module.exports = router;
