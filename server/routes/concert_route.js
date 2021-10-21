const router = require("express").Router();
const { wrapAsync } = require("../../util/util");
const {
  getCampaigns,
  getKeyvisuals,
  getCampaignInfo,
} = require("../controllers/concert_controller");

router.route("/concerts/campaigns").get(wrapAsync(getCampaigns));
router.route("/concerts/keyvisuals").get(wrapAsync(getKeyvisuals));
router.route("/concerts/details").get(wrapAsync(getCampaignInfo));

module.exports = router;
