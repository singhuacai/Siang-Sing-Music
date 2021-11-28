const { expect, requester } = require("./set_up");
const { pool } = require("../server/models/mysql");

describe("concert", function () {
  //   this.timeout(20000);
  context("concert get campaign", function () {
    it("get campaign data", async () => {
      const res = await requester.get("/api/1.0/concerts/campaigns");

      const data = res.body.data;
      const expected = [
        {
          id: 1,
          concertTitle: "五月天 [好好好想見到你] Mayday Fly to 2022 高雄演唱會",
          concertMainImage: "/1/concert_main_image.jpg",
          concertDatetime: ["2022-02-26 10:00:00", "2022-02-27 10:00:00", "2022-02-28 10:00:00"],
        },
      ];
      //   expect(data).to.eql(expected);
      expect(data).to.deep.equal(data, expected);
    });
  });
});
