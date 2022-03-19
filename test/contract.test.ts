import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Signer, utils, Wallet } from "ethers";
import { EvmeNFT, EvmeNFTFactory } from "../typechain";

jest.setTimeout(50000);

let nft: EvmeNFT;
let client: SignerWithAddress;
let owner: SignerWithAddress;
let other: SignerWithAddress;

const baseURI = "uri/";
const tier1 = 1;
const tier2 = 2;
const tier3 = 3;

const tier6 = 6;

// T1 - 10 = 10
const RARE_RANGE = 10;
// T6 - T10 limit only 1
const RARE_LIMIT_START = 6;

beforeEach(async () => {
  const signers = await ethers.getSigners();
  owner = signers[0];
  client = signers[1];
  other = signers[2];
  nft = await new EvmeNFTFactory(owner).deploy(baseURI);
});

describe("Contract", function () {
  it("Should deployed and contract address is defined.", async function () {
    expect(nft.address).toBeDefined();
  });

  it("Should holed baseURI", async function () {
    expect(await nft.baseTokenURI()).toEqual(baseURI);
  });

  it("Should return the new BaseURI once it's changed", async function () {
    const setBaseURITx = await nft.setBaseURI("Hola, mundo!");

    // wait until the transaction is mined
    await setBaseURITx.wait();

    expect(await nft.baseTokenURI()).toEqual("Hola, mundo!");
  });

  it("Should return a list of tokens of owner", async function () {
    const mintedTx1 = await nft.ownerMint(client.address, tier1);
    await mintedTx1.wait();

    const mintedTx2 = await nft.ownerMint(client.address, tier2);
    await mintedTx2.wait();

    const tokens = await nft.tokensOfOwner(client.address);
    expect(tokens).toBeDefined();
    expect(tokens[0].toNumber()).toEqual(0);
    expect(tokens[1].toNumber()).toEqual(1);
  });

  it("Should return empty list when owner is not hold any token", async function () {
    const tokens = await nft.tokensOfOwner(client.address);
    expect(tokens).toBeDefined();
    expect(tokens[0]).toBeUndefined();
  });
});

describe("Minting process", function () {
  it("Should mint success and send to client.", async function () {
    const mintedTx = await nft.ownerMint(client.address, tier1);

    // wait until the transaction is mined
    await mintedTx.wait();

    const tokens = await nft.tokensOfOwner(client.address);

    expect(tokens[0]).toBeDefined();

    expect(tokens[0].toNumber()).toEqual(0);
  });

  it("Should mint failed when minter is not an owner.", async function () {
    try {
      await nft.connect(client).ownerMint(owner.address, tier1);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          `VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'`
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  it("Minting tier 0, should failed", async function () {
    // check invalid tier 0
    await expect(nft.ownerMint(client.address, 0)).rejects.toMatchObject(
      new Error(
        `VM Exception while processing transaction: reverted with reason string 'Invalid Tier.'`
      )
    );
  });

  describe("Minting tier 1", function () {
    describe("Before minting tier 1", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count t1 token as 0 before minting", async function () {
        // check tierCount before mint
        const count = await nft.tierCounts(tier1);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting tier 1", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, tier1);
        await tx.wait();
      });

      it("Should increment t1 token count to be 1 after minting", async function () {
        // check tierCount after mint
        const count = await nft.tierCounts(tier1);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send t1 token to client", async function () {
        // check tierCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give t1 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token tier
        const token = await nft.tokenTiers(0);
        expect(token).toEqual(tier1);
      });

      it("Should return the tokenURI of t1 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier1);
      });
    });
  });

  it("Minting tier 1", async function () {
    const mintedTx = await nft.ownerMint(client.address, tier1);
    await mintedTx.wait();
    // check tierCount increment
    const tierCount = await nft.tierCounts(tier1);
    expect(tierCount.toNumber()).toEqual(1);

    // check token of owner
    const tokens = await nft.tokensOfOwner(client.address);
    expect(tokens[0]).toBeDefined();
    expect(tokens[0].toNumber()).toEqual(0);

    const tokenIndex = tokens[0].toNumber();

    // check owner of token
    const ownerTier1 = await nft.ownerOf(tokenIndex);
    expect(ownerTier1).toEqual(client.address);

    // check token tier
    const token = await nft.tokenTiers(tokenIndex);
    expect(token).toEqual(tier1);

    // check token uri
    const tier1URI = await nft.tokenURI(tokenIndex);
    expect(tier1URI.replace(baseURI, "")).toEqual("t" + tier1);
  });

  it("Minting tier 2", async function () {
    // check invalid tier keyword
    await expect(
      nft.ownerMint(client.address, tier2 + "abc")
    ).rejects.toMatchObject(
      new Error(
        `invalid BigNumber string (argument="value", value="2abc", code=INVALID_ARGUMENT, version=bignumber/5.5.0)`
      )
    );
    const mintedTx = await nft.ownerMint(client.address, tier2);

    // wait until the transaction is mined
    await mintedTx.wait();

    // check tierCount increment
    const tierCount = await nft.tierCounts(tier2);
    expect(tierCount.toNumber()).toEqual(1);

    // check token of owner
    const tokens = await nft.tokensOfOwner(client.address);
    expect(tokens[0]).toBeDefined();
    expect(tokens[0].toNumber()).toEqual(0);

    const tokenIndex = tokens[0].toNumber();

    // check owner of token
    const ownerTier1 = await nft.ownerOf(tokenIndex);
    expect(ownerTier1).toEqual(client.address);

    // check token tier
    const token = await nft.tokenTiers(tokenIndex);
    expect(token).toEqual(tier2);

    // check token uri
    const tier2URI = await nft.tokenURI(tokenIndex);
    expect(tier2URI.replace(baseURI, "")).toEqual("t" + tier2);
  });

  it("Minting tier 3", async function () {
    // check invalid tier keyword
    await expect(
      nft.ownerMint(client.address, tier3 + "abc")
    ).rejects.toMatchObject(
      new Error(
        `invalid BigNumber string (argument="value", value="3abc", code=INVALID_ARGUMENT, version=bignumber/5.5.0)`
      )
    );
    const mintedTx = await nft.ownerMint(client.address, tier3);

    // wait until the transaction is mined
    await mintedTx.wait();

    // check tierCount increment
    const tierCount = await nft.tierCounts(tier3);
    expect(tierCount.toNumber()).toEqual(1);

    // check token of owner
    const tokens = await nft.tokensOfOwner(client.address);
    expect(tokens[0]).toBeDefined();
    expect(tokens[0].toNumber()).toEqual(0);

    const tokenIndex = tokens[0].toNumber();

    // check owner of token
    const ownerTier1 = await nft.ownerOf(tokenIndex);
    expect(ownerTier1).toEqual(client.address);

    // check token tier
    const token = await nft.tokenTiers(tokenIndex);
    expect(token).toEqual(tier3);

    // check token uri
    const tier3URI = await nft.tokenURI(tokenIndex);
    expect(tier3URI.replace(baseURI, "")).toEqual("t" + tier3);
  });

  describe("Minting tier 6", function () {
    describe("Before minting tier 6", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count t6 token as 0 before minting", async function () {
        // check tierCount before mint
        const count = await nft.tierCounts(tier6);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting tier 6", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, tier6);
        await tx.wait();
      });

      it("Should increment t6 token count to be 6 after minting", async function () {
        // check tierCount after mint
        const count = await nft.tierCounts(tier6);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send t6 token to client", async function () {
        // check tierCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give t6 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token tier
        const token = await nft.tokenTiers(0);
        expect(token).toEqual(tier6);
      });

      it("Should return the tokenURI of t6 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier6);
      });

      it("Should reject when exceeded RARE_LIMIT", async function () {
        // check exceed rare limit
        try {
          await nft.ownerMint(client.address, tier6);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Exceed Rare Limit.'`
            )
          );
          return;
        }
        throw new Error("Should not reached this line.");
      });
    });
  });

  it("Minting tier 6.1", async function () {
    // check invalid tier keyword
    await expect(
      nft.ownerMint(client.address, tier6 + "abc")
    ).rejects.toMatchObject(
      new Error(
        `invalid BigNumber string (argument="value", value="6abc", code=INVALID_ARGUMENT, version=bignumber/5.5.0)`
      )
    );
    const mintedTx = await nft.ownerMint(client.address, tier6);

    // wait until the transaction is mined
    await mintedTx.wait();

    // check tierCount increment
    const tierCount = await nft.tierCounts(tier6);
    expect(tierCount.toNumber()).toEqual(1);

    // check token of owner
    const tokens = await nft.tokensOfOwner(client.address);
    expect(tokens[0]).toBeDefined();
    expect(tokens[0].toNumber()).toEqual(0);

    const tokenIndex = tokens[0].toNumber();

    // check owner of token
    const ownerTier1 = await nft.ownerOf(tokenIndex);
    expect(ownerTier1).toEqual(client.address);

    // check token tier
    const token = await nft.tokenTiers(tokenIndex);
    expect(token).toEqual(tier6);

    // check token uri
    const tier6URI = await nft.tokenURI(tokenIndex);
    expect(tier6URI.replace(baseURI, "")).toEqual("t" + tier6);

    // check exceed rare limit
    try {
      await nft.ownerMint(client.address, tier6);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          `VM Exception while processing transaction: reverted with reason string 'Exceed Rare Limit.'`
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  it("Minting tier 1-10", async function () {
    for (let tier = 1; tier <= RARE_RANGE; tier++) {
      // check invalid tier keyword
      await expect(
        nft.ownerMint(client.address, tier + "abc")
      ).rejects.toMatchObject(
        new Error(
          `invalid BigNumber string (argument="value", value="${tier}abc", code=INVALID_ARGUMENT, version=bignumber/5.5.0)`
        )
      );
      const mintedTx = await nft.ownerMint(client.address, tier);

      // wait until the transaction is mined
      await mintedTx.wait();

      // check tierCount increment
      const tierCount = await nft.tierCounts(tier);
      expect(tierCount.toNumber()).toEqual(1);

      // check token of owner
      const tokens = await nft.tokensOfOwner(client.address);
      expect(tokens[tier - 1]).toBeDefined();
      expect(tokens[tier - 1].toNumber()).toEqual(tier - 1);

      const tokenIndex = tokens[tier - 1].toNumber();

      // check owner of token
      const ownerTier = await nft.ownerOf(tokenIndex);
      expect(ownerTier).toEqual(client.address);

      // check token tier
      const token = await nft.tokenTiers(tokenIndex);
      expect(token).toEqual(tier);

      // check token uri
      const tierURI = await nft.tokenURI(tokenIndex);
      expect(tierURI.replace(baseURI, "")).toEqual("t" + tier);

      if (tier >= RARE_LIMIT_START) {
        // check exceed rare limit
        try {
          await nft.ownerMint(client.address, tier);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Exceed Rare Limit.'`
            )
          );
          continue;
        }
        throw new Error("Should not reached this line.");
      }
    }
  });
});

describe("Campaign", function () {
  it("Should create campaign success", async function () {
    const mintedTx = await nft.createCampaign("campaign", "description");

    // wait until the transaction is mined
    await mintedTx.wait();

    const campaignIndex = await nft.campaignIndex();
    expect(campaignIndex.toNumber()).toEqual(1);

    const index = campaignIndex.toNumber() - 1;

    const campaign = await nft.campaignByIndex(index);

    expect(campaign.name).toEqual("campaign");
    expect(campaign.description).toEqual("description");
    expect(campaign.complete).toEqual(false);
    expect(campaign.redemptionIndex.toNumber()).toEqual(0);
  });

  it("Can set campaign status (true or false)", async function () {
    const mintedTx = await nft.createCampaign("campaign", "description");

    // wait until the transaction is mined
    await mintedTx.wait();

    const setStatusTx = await nft.setCampaignStatus(0, true);
    await setStatusTx.wait();

    const campaignComplete = await nft.campaignByIndex(0);
    expect(campaignComplete.complete).toEqual(true);

    const setStatusTx2 = await nft.setCampaignStatus(0, false);
    await setStatusTx2.wait();

    const campaignInComplete = await nft.campaignByIndex(0);
    expect(campaignInComplete.complete).toEqual(false);
  });

  it("Should failed create campaign when creator is not an owner", async function () {
    try {
      await nft.connect(client).createCampaign("campaign", "description");
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });
});

describe("Redemption", function () {
  beforeEach(async () => {
    // creating campaign
    const cratedCampaignTx = await nft.createCampaign(
      "campaign",
      "description"
    );
    await cratedCampaignTx.wait();

    // mint to client
    const mintedTx = await nft.ownerMint(client.address, tier1);
    await mintedTx.wait();
  });

  it("Should not have any redemption in the given campaign", async function () {
    const campaign = await nft.campaignByIndex(0);
    expect(campaign.redemptionIndex.toNumber()).toEqual(0);
  });

  it("Should return falsy redeem status of client t1 token", async function () {
    const status = await nft.connect(client).campaignRedemptionByIndex(0, 0);
    expect(status).toEqual(false);
  });

  it("Should let the client call to check the redeem status of their token", async function () {
    const status = await nft.campaignRedemptionByIndex(0, 0);
    expect(status).toEqual(false);
  });

  it("Cannot check redeem status by others", async function () {
    try {
      await nft.connect(other).campaignRedemptionByIndex(0, 0);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'You are not token owner or contract owner.'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  describe("Redeem token 1", function () {
    beforeEach(async () => {
      const tx = await nft.connect(client).redeemByCampaignIndex(0, 0);
      await tx.wait();
    });
    it("Should successfully redeem by token owner", async function () {
      const status = await nft.connect(client).campaignRedemptionByIndex(0, 0);
      expect(status).toEqual(true);
    });

    it("Should increment redemption count", async function () {
      // check redemption index
      const campaign = await nft.campaignByIndex(0);
      expect(campaign.redemptionIndex.toNumber()).toEqual(1);
    });
  });

  it("Should redeem failed when redeemer is not the owner", async function () {
    try {
      await nft.redeemByCampaignIndex(0, 0);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'You are not the owner.'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  it("Should redeem failed when redeem other token", async function () {
    try {
      await nft.connect(client).redeemByCampaignIndex(0, 1);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'ERC721: owner query for nonexistent token'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  it("Should redeem failed when campaign is over", async function () {
    const campaignTx = await nft.setCampaignStatus(0, true);
    await campaignTx.wait();
    try {
      await nft.connect(client).redeemByCampaignIndex(0, 0);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'Campaign not exist.'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  it("Should redeem failed when duplicate redeem", async function () {
    const redeemTx = await nft.connect(client).redeemByCampaignIndex(0, 0);
    await redeemTx.wait();
    try {
      await nft.connect(client).redeemByCampaignIndex(0, 0);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'Already redeem.'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });

  it("Should redeem failed when campaign not found", async function () {
    try {
      await nft.connect(client).redeemByCampaignIndex(1, 0);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          "VM Exception while processing transaction: reverted with reason string 'Campaign not exist.'"
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });
});
