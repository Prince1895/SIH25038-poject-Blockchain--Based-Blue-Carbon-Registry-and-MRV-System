import { expect } from "chai";
import { network } from "hardhat";
describe("BlueCarbonRegistry", function () {
  async function deployRegistryFixture() {
    const { ethers } = await network.connect();
    const [owner, otherAccount] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("BlueCarbonRegistry");
    const blueCarbonRegistry = await Registry.deploy();
    return { blueCarbonRegistry, owner, otherAccount, ethers };
  }
//first test case
  describe("Deployment", function () {
    it("Should deploy without errors", async function () {
      const { blueCarbonRegistry } = await deployRegistryFixture();

      expect(await blueCarbonRegistry.getAddress()).to.not.be.null;
      expect(await blueCarbonRegistry.getAddress()).to.be.properAddress;
    });

    it("Should set the right admin role", async function () {
      const { blueCarbonRegistry, owner } = await deployRegistryFixture();
      const adminRole = await blueCarbonRegistry.ADMIN_ROLE();
      expect(await blueCarbonRegistry.hasRole(adminRole, owner.address)).to.be.true;
    });
  });
});