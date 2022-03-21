import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
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
const tier4 = 4;
const tier5 = 5;

// T1 - T5 = 5
const RARE_RANGE = 5;

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

  it("Should display symbol EVme1", async function () {
    expect(await nft.symbol()).toEqual("EVme1");
  });

  it("Should display name EVme NFT Series 1", async function () {
    expect(await nft.name()).toEqual("EVme NFT Series 1");
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

  it("Minting tier 6, should failed", async function () {
    // check invalid tier 0
    await expect(nft.ownerMint(client.address, 6)).rejects.toMatchObject(
      new Error(
        `Transaction reverted: function was called with incorrect parameters`
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
        const token = await nft.tokenIdToTier(0);
        expect(token).toEqual(tier1);
      });

      it("Should return the tokenURI of t1 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier1);
      });
    });
  });

  describe("Minting tier 2", function () {
    describe("Before minting tier 2", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count t2 token as 0 before minting", async function () {
        // check tierCount before mint
        const count = await nft.tierCounts(tier2);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting tier 2", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, tier2);
        await tx.wait();
      });

      it("Should increment t2 token count to be 1 after minting", async function () {
        // check tierCount after mint
        const count = await nft.tierCounts(tier2);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send t2 token to client", async function () {
        // check tierCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give t2 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token tier
        const token = await nft.tokenIdToTier(0);
        expect(token).toEqual(tier2);
      });

      it("Should return the tokenURI of t2 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier2);
      });
    });
  });

  describe("Minting tier 3", function () {
    describe("Before minting tier 3", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count t3 token as 0 before minting", async function () {
        // check tierCount before mint
        const count = await nft.tierCounts(tier3);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting tier 3", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, tier3);
        await tx.wait();
      });

      it("Should increment t3 token count to be 1 after minting", async function () {
        // check tierCount after mint
        const count = await nft.tierCounts(tier3);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send t3 token to client", async function () {
        // check tierCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give t3 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token tier
        const token = await nft.tokenIdToTier(0);
        expect(token).toEqual(tier3);
      });

      it("Should return the tokenURI of t3 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier3);
      });
    });
  });

  describe("Minting tier 4", function () {
    describe("Before minting tier 4", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count t4 token as 0 before minting", async function () {
        // check tierCount before mint
        const count = await nft.tierCounts(tier4);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting tier 4", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, tier4);
        await tx.wait();
      });

      it("Should increment t4 token count to be 1 after minting", async function () {
        // check tierCount after mint
        const count = await nft.tierCounts(tier4);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send t4 token to client", async function () {
        // check tierCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give t4 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token tier
        const token = await nft.tokenIdToTier(0);
        expect(token).toEqual(tier4);
      });

      it("Should return the tokenURI of t4 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier4);
      });
    });
  });

  describe("Minting tier 5", function () {
    describe("Before minting tier 5", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count t5 token as 0 before minting", async function () {
        // check tierCount before mint
        const count = await nft.tierCounts(tier5);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting tier 5", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, tier5);
        await tx.wait();
      });

      it("Should increment t5 token count to be 1 after minting", async function () {
        // check tierCount after mint
        const count = await nft.tierCounts(tier5);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send t5 token to client", async function () {
        // check tierCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give t5 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token tier
        const token = await nft.tokenIdToTier(0);
        expect(token).toEqual(tier5);
      });

      it("Should return the tokenURI of t5 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("t" + tier5);
      });
    });
  });

  it("Minting tier 1-5 (consecutive case)", async function () {
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
      const token = await nft.tokenIdToTier(tokenIndex);
      expect(token).toEqual(tier);

      // check token uri
      const tierURI = await nft.tokenURI(tokenIndex);
      expect(tierURI.replace(baseURI, "")).toEqual("t" + tier);
    }
  });
});

describe("Black List process", function () {
  describe("Before Black List", function () {
    it("Should not mark blacklist of any token before minting", async function () {
      const token = await nft.tokenBlackLists(0);
      expect(token).toEqual(false);
    });
  });

  describe("After minting tier 1", function () {
    beforeEach(async () => {
      const tx1 = await nft.ownerMint(client.address, tier1);
      await tx1.wait();

      const tx2 = await nft.ownerMint(client.address, tier2);
      await tx2.wait();

      const tx3 = await nft.ownerMint(client.address, tier3);
      await tx3.wait();

      const blTx = await nft.ownerMarkBlackList(1, true);
      await blTx.wait();
    });

    it("Should mark token id 1 as a black list", async function () {
      const token = await nft.tokenBlackLists(1);
      expect(token).toEqual(true);
    });

    it("Should not mark token id 0, 2 as a black list", async function () {
      const token0 = await nft.tokenBlackLists(0);
      expect(token0).toEqual(false);

      const token2 = await nft.tokenBlackLists(2);
      expect(token2).toEqual(false);
    });

    it("Should mark token id 1 twice", async function () {
      const mark1 = await nft.tokenBlackLists(1);
      expect(mark1).toEqual(true);

      const mark2 = await nft.tokenBlackLists(1);
      expect(mark2).toEqual(true);
    });

    it("Should revert mark token id 1", async function () {
      const token = await nft.tokenBlackLists(1);
      expect(token).toEqual(true);

      const blTx = await nft.ownerMarkBlackList(1, false);
      await blTx.wait();

      const _token = await nft.tokenBlackLists(1);
      expect(_token).toEqual(false);
    });

    it("Should mark failed when marker is not an owner.", async function () {
      try {
        await nft.connect(client).ownerMarkBlackList(2, true);
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

    it("Should mark failed when token ID is not exist.", async function () {
      try {
        await nft.ownerMarkBlackList(99, true);
      } catch (error) {
        expect(error).toMatchObject(
          new Error(
            `VM Exception while processing transaction: reverted with reason string 'ERC721Metadata: URI query for nonexistent token'`
          )
        );
        return;
      }
      throw new Error("Should not reached this line.");
    });
  });
});

describe("Transfer process", function () {
  beforeEach(async () => {
    const tx = await nft.ownerMint(client.address, tier1);
    await tx.wait();
  });
  it("Should transfer from client(not contract owner) to others", async function () {
    const tx = await nft
      .connect(client)
      .transferFrom(client.address, other.address, 0);
    await tx.wait();

    const address = await nft.ownerOf(0);
    expect(address).toEqual(other.address);
  });
});
