const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DaoBadge", function () {
  let daoBadge;
  let daoBadgeAsAddr1;
  let signers = [];
  let owner = {};
  let addr1 = {};
  let addr2 = {};
  let addr3 = {};

  const testURI = "testuri";
  const testURI2 = "testuri2";
  const testURI3 = "testuri3";

  beforeEach(async function () {
    signers = await ethers.getSigners();
    owner = signers[0];
    addr1 = signers[1];
    addr2 = signers[2];
    addr3 = signers[3];
    const DaoBadge = await ethers.getContractFactory("DaoBadge");
    daoBadge = await DaoBadge.deploy();
    await daoBadge.deployed();
    daoBadgeAsAddr1 = daoBadge.connect(addr1);
    daoBadgeAsAddr2 = daoBadge.connect(addr2);

  });
  it("Should be symbol", async function () {
    expect(await daoBadge.symbol()).to.equal("RBD");
  });
  it("Should be able to Mint 1 off as owner", async function () {
    await daoBadge.safeMint(addr1.address, testURI);
    expect(await daoBadge.tokenURI(0)).to.equal(testURI);
  });
  it("Should be able to set new badge as owner", async function () {
    const setBadge = await daoBadge.setBadge(0, 2, testURI, "test name", "test details");

    const [badgeId,limit,uri,name,details] = await daoBadge.badgeMetas(1);
    expect(await badgeId.toString()).to.equal("1");
    expect(await name.toString()).to.equal("test name");

  });
  describe("DaoBadge badges", function () {
    beforeEach(async function () {
      await daoBadge.setBadge(0, 2, testURI3, "test name", "test details");
      await daoBadge.safeMintBadge(addr1.address, 1);
    });
    it("Should be able to update badge as owner", async function () {
      await daoBadge.setBadge(1, 2, testURI2, "test name 2", "test details");
      const [badgeId,limit,uri,name,details] = await daoBadge.badgeMetas(1);
      expect(await badgeId.toString()).to.equal("1");
      expect(await name.toString()).to.equal("test name 2");
      expect(await uri.toString()).to.equal(testURI2);
    });
    it("Should be able to mint badge for someone as badge holder", async function () {
      await daoBadgeAsAddr1.safeMintBadgeAsBadgeOwner(addr2.address, 0);
      
      expect(await daoBadge.tokenURI(1)).to.equal(testURI3);
      expect(await daoBadge.ownerOf(1)).to.equal(addr2.address);

    });
    it("Should not be able to mint badge if not badge holder", async function () {
      const mint = daoBadgeAsAddr2.safeMintBadgeAsBadgeOwner(addr3.address, 0);
      await expect(mint).to.be.revertedWith("not owner");

    });
    it("Should return badge uri", async function () {
      expect(await daoBadge.tokenURI(0)).to.equal(testURI3);
    });
    it("Should be able to updoot as badge owner", async function () {
      await daoBadgeAsAddr1.safeMintBadgeAsBadgeOwner(addr2.address, 0);
      await daoBadgeAsAddr1.doot(0,1);
      const [exists, score, doots,] = await daoBadge.badges(1);
      expect(score).to.equal(1);
    });
    it("Should not be able to updoot as badge owner twice", async function () {
      await daoBadgeAsAddr1.safeMintBadgeAsBadgeOwner(addr2.address, 0);
      await daoBadgeAsAddr1.doot(0,1);
      const secondDoot = daoBadgeAsAddr1.doot(0,1);
      await expect(secondDoot).to.be.revertedWith("already dooted");
    });
    it("Should be able to remove doot", async function () {
      await daoBadgeAsAddr1.safeMintBadgeAsBadgeOwner(addr2.address, 0);
      await daoBadgeAsAddr1.doot(0,1);
      await daoBadgeAsAddr1.removeDoot(0,1);
      const [exists, score, doots,] = await daoBadge.badges(1);
      expect(score).to.equal(0);

    });

    it("Should rest score on transfer", async function () {

    });
  });
});
