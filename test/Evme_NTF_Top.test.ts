import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { EvmeNFTTop, EvmeNFTTopFactory } from "../typechain";

jest.setTimeout(50000);

let nft: EvmeNFTTop;
let client: SignerWithAddress;
let owner: SignerWithAddress;
let other: SignerWithAddress;

const baseURI = "uri/";
const design1 = 1;
const design2 = 2;
const design3 = 3;
const design4 = 4;
const design5 = 5;

const NUMBER_OF_DESIGNS = 5;

beforeEach(async () => {
  const signers = await ethers.getSigners();
  owner = signers[0];
  client = signers[1];
  other = signers[2];
  nft = await new EvmeNFTTopFactory(owner).deploy(baseURI);
});

describe("Contract", function () {
  it("Should deployed and contract address is defined.", async function () {
    expect(nft.address).toBeDefined();
  });

  it("Should display symbol EVmeTOP", async function () {
    expect(await nft.symbol()).toEqual("EVmeTOP");
  });

  it("Should display name EVme NFT Top", async function () {
    expect(await nft.name()).toEqual("EVme NFT Top");
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
    const mintedTx1 = await nft.ownerMint(client.address, design1);
    await mintedTx1.wait();

    const mintedTx2 = await nft.ownerMint(client.address, design2);
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
    const mintedTx = await nft.ownerMint(client.address, design1);

    // wait until the transaction is mined
    await mintedTx.wait();

    const tokens = await nft.tokensOfOwner(client.address);

    expect(tokens[0]).toBeDefined();

    expect(tokens[0].toNumber()).toEqual(0);
  });

  it("Should mint failed when minter is not an owner.", async function () {
    try {
      await nft.connect(client).ownerMint(owner.address, design1);
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

  it("Minting design 0, should failed", async function () {
    // check invalid design 0
    await expect(nft.ownerMint(client.address, 0)).rejects.toMatchObject(
      new Error(
        `VM Exception while processing transaction: reverted with reason string 'Invalid Design.'`
      )
    );
  });

  it("Minting design 6, should failed", async function () {
    await expect(nft.ownerMint(client.address, 6)).rejects.toMatchObject(
      new Error(
        `Transaction reverted: function was called with incorrect parameters`
      )
    );
  });

  describe("Minting design 1", function () {
    describe("Before minting design 1", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count d1 token as 0 before minting", async function () {
        // check designCount before mint
        const count = await nft.designCounts(design1);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting design 1", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, design1);
        await tx.wait();
      });

      it("Should increment d1 token count to be 1 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design1);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send d1 token to client", async function () {
        // check designCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give d1 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token design
        const token = await nft.tokenIdToDesign(0);
        expect(token).toEqual(design1);
      });

      it("Should return the tokenURI of d1 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("d" + design1);
      });
    });

    describe("Minting 5 of design 1 (consecutive)", function () {
      beforeEach(async () => {
        const tx1 = await nft.ownerMint(client.address, design1);
        await tx1.wait();
        const tx2 = await nft.ownerMint(client.address, design1);
        await tx2.wait();
        const tx3 = await nft.ownerMint(client.address, design1);
        await tx3.wait();
        const tx4 = await nft.ownerMint(client.address, design1);
        await tx4.wait();
        const tx5 = await nft.ownerMint(client.address, design1);
        await tx5.wait();
      });

      it("Should increment d1 token count to be 5 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design1);
        expect(count.toNumber()).toEqual(5);
      });

      it("Should successfully send 5 d1 token to client", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0].toNumber()).toEqual(0);
        expect(tokens[1].toNumber()).toEqual(1);
        expect(tokens[2].toNumber()).toEqual(2);
        expect(tokens[3].toNumber()).toEqual(3);
        expect(tokens[4].toNumber()).toEqual(4);
      });

      it("Should give 5 d1 token ownership to client", async function () {
        expect(await nft.ownerOf(0)).toEqual(client.address);
        expect(await nft.ownerOf(1)).toEqual(client.address);
        expect(await nft.ownerOf(2)).toEqual(client.address);
        expect(await nft.ownerOf(3)).toEqual(client.address);
        expect(await nft.ownerOf(4)).toEqual(client.address);

        // check token design
        expect(await nft.tokenIdToDesign(0)).toEqual(design1);
        expect(await nft.tokenIdToDesign(1)).toEqual(design1);
        expect(await nft.tokenIdToDesign(2)).toEqual(design1);
        expect(await nft.tokenIdToDesign(3)).toEqual(design1);
        expect(await nft.tokenIdToDesign(4)).toEqual(design1);
      });

      it("Should return the tokenURI of d1 token", async function () {
        // check token uri
        expect((await nft.tokenURI(0)).replace(baseURI, "")).toEqual(
          "d" + design1
        );
        expect((await nft.tokenURI(1)).replace(baseURI, "")).toEqual(
          "d" + design1
        );
        expect((await nft.tokenURI(2)).replace(baseURI, "")).toEqual(
          "d" + design1
        );
        expect((await nft.tokenURI(3)).replace(baseURI, "")).toEqual(
          "d" + design1
        );
        expect((await nft.tokenURI(4)).replace(baseURI, "")).toEqual(
          "d" + design1
        );
      });

      it("Should failed mint 6th of d1", async function () {
        try {
          await nft.ownerMint(client.address, design1);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Reached the maximum number of NFTs in this Design'`
            )
          );
          return;
        }
        throw new Error("Should not reached this line.");
      });
    });
  });

  describe("Minting design 2", function () {
    describe("Before minting design 2", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count s2 token as 0 before minting", async function () {
        // check designCount before mint
        const count = await nft.designCounts(design2);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting design 2", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, design2);
        await tx.wait();
      });

      it("Should increment s2 token count to be 1 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design2);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send s2 token to client", async function () {
        // check designCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give s2 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token design
        const token = await nft.tokenIdToDesign(0);
        expect(token).toEqual(design2);
      });

      it("Should return the tokenURI of s2 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("d" + design2);
      });
    });

    describe("Minting 5 of design 2 (consecutive)", function () {
      beforeEach(async () => {
        const tx1 = await nft.ownerMint(client.address, design2);
        await tx1.wait();
        const tx2 = await nft.ownerMint(client.address, design2);
        await tx2.wait();
        const tx3 = await nft.ownerMint(client.address, design2);
        await tx3.wait();
        const tx4 = await nft.ownerMint(client.address, design2);
        await tx4.wait();
        const tx5 = await nft.ownerMint(client.address, design2);
        await tx5.wait();
      });

      it("Should increment s2 token count to be 5 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design2);
        expect(count.toNumber()).toEqual(5);
      });

      it("Should successfully send 5 s2 token to client", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0].toNumber()).toEqual(0);
        expect(tokens[1].toNumber()).toEqual(1);
        expect(tokens[2].toNumber()).toEqual(2);
        expect(tokens[3].toNumber()).toEqual(3);
        expect(tokens[4].toNumber()).toEqual(4);
      });

      it("Should give 5 s2 token ownership to client", async function () {
        expect(await nft.ownerOf(0)).toEqual(client.address);
        expect(await nft.ownerOf(1)).toEqual(client.address);
        expect(await nft.ownerOf(2)).toEqual(client.address);
        expect(await nft.ownerOf(3)).toEqual(client.address);
        expect(await nft.ownerOf(4)).toEqual(client.address);

        // check token design
        expect(await nft.tokenIdToDesign(0)).toEqual(design2);
        expect(await nft.tokenIdToDesign(1)).toEqual(design2);
        expect(await nft.tokenIdToDesign(2)).toEqual(design2);
        expect(await nft.tokenIdToDesign(3)).toEqual(design2);
        expect(await nft.tokenIdToDesign(4)).toEqual(design2);
      });

      it("Should return the tokenURI of s2 token", async function () {
        // check token uri
        expect((await nft.tokenURI(0)).replace(baseURI, "")).toEqual(
          "d" + design2
        );
        expect((await nft.tokenURI(1)).replace(baseURI, "")).toEqual(
          "d" + design2
        );
        expect((await nft.tokenURI(2)).replace(baseURI, "")).toEqual(
          "d" + design2
        );
        expect((await nft.tokenURI(3)).replace(baseURI, "")).toEqual(
          "d" + design2
        );
        expect((await nft.tokenURI(4)).replace(baseURI, "")).toEqual(
          "d" + design2
        );
      });

      it("Should failed mint 6th of s2", async function () {
        try {
          await nft.ownerMint(client.address, design2);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Reached the maximum number of NFTs in this Design'`
            )
          );
          return;
        }
        throw new Error("Should not reached this line.");
      });
    });
  });

  describe("Minting design 3", function () {
    describe("Before minting design 3", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count s3 token as 0 before minting", async function () {
        // check designCount before mint
        const count = await nft.designCounts(design3);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting design 3", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, design3);
        await tx.wait();
      });

      it("Should increment s3 token count to be 1 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design3);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send s3 token to client", async function () {
        // check designCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give s3 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token design
        const token = await nft.tokenIdToDesign(0);
        expect(token).toEqual(design3);
      });

      it("Should return the tokenURI of s3 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("d" + design3);
      });
    });

    describe("Minting 5 of design 3 (consecutive)", function () {
      beforeEach(async () => {
        const tx1 = await nft.ownerMint(client.address, design3);
        await tx1.wait();
        const tx2 = await nft.ownerMint(client.address, design3);
        await tx2.wait();
        const tx3 = await nft.ownerMint(client.address, design3);
        await tx3.wait();
        const tx4 = await nft.ownerMint(client.address, design3);
        await tx4.wait();
        const tx5 = await nft.ownerMint(client.address, design3);
        await tx5.wait();
      });

      it("Should increment s3 token count to be 5 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design3);
        expect(count.toNumber()).toEqual(5);
      });

      it("Should successfully send 5 s3 token to client", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0].toNumber()).toEqual(0);
        expect(tokens[1].toNumber()).toEqual(1);
        expect(tokens[2].toNumber()).toEqual(2);
        expect(tokens[3].toNumber()).toEqual(3);
        expect(tokens[4].toNumber()).toEqual(4);
      });

      it("Should give 5 s3 token ownership to client", async function () {
        expect(await nft.ownerOf(0)).toEqual(client.address);
        expect(await nft.ownerOf(1)).toEqual(client.address);
        expect(await nft.ownerOf(2)).toEqual(client.address);
        expect(await nft.ownerOf(3)).toEqual(client.address);
        expect(await nft.ownerOf(4)).toEqual(client.address);

        // check token design
        expect(await nft.tokenIdToDesign(0)).toEqual(design3);
        expect(await nft.tokenIdToDesign(1)).toEqual(design3);
        expect(await nft.tokenIdToDesign(2)).toEqual(design3);
        expect(await nft.tokenIdToDesign(3)).toEqual(design3);
        expect(await nft.tokenIdToDesign(4)).toEqual(design3);
      });

      it("Should return the tokenURI of s3 token", async function () {
        // check token uri
        expect((await nft.tokenURI(0)).replace(baseURI, "")).toEqual(
          "d" + design3
        );
        expect((await nft.tokenURI(1)).replace(baseURI, "")).toEqual(
          "d" + design3
        );
        expect((await nft.tokenURI(2)).replace(baseURI, "")).toEqual(
          "d" + design3
        );
        expect((await nft.tokenURI(3)).replace(baseURI, "")).toEqual(
          "d" + design3
        );
        expect((await nft.tokenURI(4)).replace(baseURI, "")).toEqual(
          "d" + design3
        );
      });

      it("Should failed mint 6th of s3", async function () {
        try {
          await nft.ownerMint(client.address, design3);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Reached the maximum number of NFTs in this Design'`
            )
          );
          return;
        }
        throw new Error("Should not reached this line.");
      });
    });
  });

  describe("Minting design 4", function () {
    describe("Before minting design 4", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count s4 token as 0 before minting", async function () {
        // check designCount before mint
        const count = await nft.designCounts(design4);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting design 4", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, design4);
        await tx.wait();
      });

      it("Should increment s4 token count to be 1 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design4);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send s4 token to client", async function () {
        // check designCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give s4 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token design
        const token = await nft.tokenIdToDesign(0);
        expect(token).toEqual(design4);
      });

      it("Should return the tokenURI of s4 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("d" + design4);
      });
    });

    describe("Minting 5 of design 4 (consecutive)", function () {
      beforeEach(async () => {
        const tx1 = await nft.ownerMint(client.address, design4);
        await tx1.wait();
        const tx2 = await nft.ownerMint(client.address, design4);
        await tx2.wait();
        const tx3 = await nft.ownerMint(client.address, design4);
        await tx3.wait();
        const tx4 = await nft.ownerMint(client.address, design4);
        await tx4.wait();
        const tx5 = await nft.ownerMint(client.address, design4);
        await tx5.wait();
      });

      it("Should increment s4 token count to be 5 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design4);
        expect(count.toNumber()).toEqual(5);
      });

      it("Should successfully send 5 s4 token to client", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0].toNumber()).toEqual(0);
        expect(tokens[1].toNumber()).toEqual(1);
        expect(tokens[2].toNumber()).toEqual(2);
        expect(tokens[3].toNumber()).toEqual(3);
        expect(tokens[4].toNumber()).toEqual(4);
      });

      it("Should give 5 s4 token ownership to client", async function () {
        expect(await nft.ownerOf(0)).toEqual(client.address);
        expect(await nft.ownerOf(1)).toEqual(client.address);
        expect(await nft.ownerOf(2)).toEqual(client.address);
        expect(await nft.ownerOf(3)).toEqual(client.address);
        expect(await nft.ownerOf(4)).toEqual(client.address);

        // check token design
        expect(await nft.tokenIdToDesign(0)).toEqual(design4);
        expect(await nft.tokenIdToDesign(1)).toEqual(design4);
        expect(await nft.tokenIdToDesign(2)).toEqual(design4);
        expect(await nft.tokenIdToDesign(3)).toEqual(design4);
        expect(await nft.tokenIdToDesign(4)).toEqual(design4);
      });

      it("Should return the tokenURI of s4 token", async function () {
        // check token uri
        expect((await nft.tokenURI(0)).replace(baseURI, "")).toEqual(
          "d" + design4
        );
        expect((await nft.tokenURI(1)).replace(baseURI, "")).toEqual(
          "d" + design4
        );
        expect((await nft.tokenURI(2)).replace(baseURI, "")).toEqual(
          "d" + design4
        );
        expect((await nft.tokenURI(3)).replace(baseURI, "")).toEqual(
          "d" + design4
        );
        expect((await nft.tokenURI(4)).replace(baseURI, "")).toEqual(
          "d" + design4
        );
      });

      it("Should failed mint 6th of s4", async function () {
        try {
          await nft.ownerMint(client.address, design4);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Reached the maximum number of NFTs in this Design'`
            )
          );
          return;
        }
        throw new Error("Should not reached this line.");
      });
    });
  });

  describe("Minting design 5", function () {
    describe("Before minting design 5", function () {
      it("Should not let the client owned any token before minting", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens).toBeDefined();
        expect(tokens[0]).toBeUndefined();
      });

      it("Should count s5 token as 0 before minting", async function () {
        // check designCount before mint
        const count = await nft.designCounts(design5);
        expect(count.toNumber()).toEqual(0);
      });
    });

    describe("After minting design 5", function () {
      beforeEach(async () => {
        const tx = await nft.ownerMint(client.address, design5);
        await tx.wait();
      });

      it("Should increment s5 token count to be 1 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design5);
        expect(count.toNumber()).toEqual(1);
      });

      it("Should successfully send s5 token to client", async function () {
        // check designCount after mint
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0]).toBeDefined();
        expect(tokens[0].toNumber()).toEqual(0);
      });

      it("Should give s5 token ownership to client", async function () {
        // check owner of token
        const owner = await nft.ownerOf(0);
        expect(owner).toEqual(client.address);

        // check token design
        const token = await nft.tokenIdToDesign(0);
        expect(token).toEqual(design5);
      });

      it("Should return the tokenURI of s5 token", async function () {
        // check token uri
        const uri = await nft.tokenURI(0);
        expect(uri.replace(baseURI, "")).toEqual("d" + design5);
      });
    });

    describe("Minting 5 of design 5 (consecutive)", function () {
      beforeEach(async () => {
        const tx1 = await nft.ownerMint(client.address, design5);
        await tx1.wait();
        const tx2 = await nft.ownerMint(client.address, design5);
        await tx2.wait();
        const tx3 = await nft.ownerMint(client.address, design5);
        await tx3.wait();
        const tx4 = await nft.ownerMint(client.address, design5);
        await tx4.wait();
        const tx5 = await nft.ownerMint(client.address, design5);
        await tx5.wait();
      });

      it("Should increment s5 token count to be 5 after minting", async function () {
        // check designCount after mint
        const count = await nft.designCounts(design5);
        expect(count.toNumber()).toEqual(5);
      });

      it("Should successfully send 5 s5 token to client", async function () {
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[0].toNumber()).toEqual(0);
        expect(tokens[1].toNumber()).toEqual(1);
        expect(tokens[2].toNumber()).toEqual(2);
        expect(tokens[3].toNumber()).toEqual(3);
        expect(tokens[4].toNumber()).toEqual(4);
      });

      it("Should give 5 s5 token ownership to client", async function () {
        expect(await nft.ownerOf(0)).toEqual(client.address);
        expect(await nft.ownerOf(1)).toEqual(client.address);
        expect(await nft.ownerOf(2)).toEqual(client.address);
        expect(await nft.ownerOf(3)).toEqual(client.address);
        expect(await nft.ownerOf(4)).toEqual(client.address);

        // check token design
        expect(await nft.tokenIdToDesign(0)).toEqual(design5);
        expect(await nft.tokenIdToDesign(1)).toEqual(design5);
        expect(await nft.tokenIdToDesign(2)).toEqual(design5);
        expect(await nft.tokenIdToDesign(3)).toEqual(design5);
        expect(await nft.tokenIdToDesign(4)).toEqual(design5);
      });

      it("Should return the tokenURI of s5 token", async function () {
        // check token uri
        expect((await nft.tokenURI(0)).replace(baseURI, "")).toEqual(
          "d" + design5
        );
        expect((await nft.tokenURI(1)).replace(baseURI, "")).toEqual(
          "d" + design5
        );
        expect((await nft.tokenURI(2)).replace(baseURI, "")).toEqual(
          "d" + design5
        );
        expect((await nft.tokenURI(3)).replace(baseURI, "")).toEqual(
          "d" + design5
        );
        expect((await nft.tokenURI(4)).replace(baseURI, "")).toEqual(
          "d" + design5
        );
      });

      it("Should failed mint 6th of s5", async function () {
        try {
          await nft.ownerMint(client.address, design5);
        } catch (error) {
          expect(error).toMatchObject(
            new Error(
              `VM Exception while processing transaction: reverted with reason string 'Reached the maximum number of NFTs in this Design'`
            )
          );
          return;
        }
        throw new Error("Should not reached this line.");
      });
    });
  });

  it("Minting 25 of design 1-5 (consecutive case) and 26th should failed", async function () {
    let tokenId = 0;
    for (let design = 1; design <= NUMBER_OF_DESIGNS; design++) {
      for (let tokenCount = 1; tokenCount <= 5; tokenCount++) {
        const mintedTx = await nft.ownerMint(client.address, design);

        // wait until the transaction is mined
        await mintedTx.wait();

        // check designCount increment
        const designCount = await nft.designCounts(design);
        expect(designCount.toNumber()).toEqual(tokenCount);

        // check token of owner
        const tokens = await nft.tokensOfOwner(client.address);
        expect(tokens[tokenId]).toBeDefined();
        expect(tokens[tokenId].toNumber()).toEqual(tokenId);

        // check owner of token
        const ownerTier = await nft.ownerOf(tokenId);
        expect(ownerTier).toEqual(client.address);

        // check token design
        const token = await nft.tokenIdToDesign(tokenId);
        expect(token).toEqual(design);

        // check token uri
        const designURI = await nft.tokenURI(tokenId);
        expect(designURI.replace(baseURI, "")).toEqual("d" + design);

        tokenId++;
      }
    }
    try {
      await nft.ownerMint(client.address, design5);
    } catch (error) {
      expect(error).toMatchObject(
        new Error(
          `VM Exception while processing transaction: reverted with reason string 'Reached the maximum number of NFTs'`
        )
      );
      return;
    }
    throw new Error("Should not reached this line.");
  });
});

describe("Transfer process", function () {
  beforeEach(async () => {
    const tx = await nft.ownerMint(client.address, design1);
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
