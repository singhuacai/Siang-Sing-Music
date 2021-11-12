const router = require("express").Router();
const { wrapAsync } = require("../../util/util");
const {
  getCampaigns,
  getKeyvisuals,
  getConcertDetails,
  getCampaignsByKeyword,
} = require("../controllers/concert_controller");

router.route("/concerts/campaigns").get(wrapAsync(getCampaigns));
router.route("/concerts/keyvisuals").get(wrapAsync(getKeyvisuals));
router.route("/concerts/details").get(wrapAsync(getConcertDetails));
router.route("/concerts/search").get(wrapAsync(getCampaignsByKeyword));

module.exports = router;
