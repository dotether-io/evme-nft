const { default: axios } = require("axios");
const fetch = require("node-fetch");
require("dotenv").config();

const main = async () => {
  const fromTokenId = 1;
  const toTokenId = 55;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  console.log(
    "🚀 ~ file: refresh.js ~ line 8 ~ main ~ contractAddress",
    contractAddress
  );
  for (let tokenId = fromTokenId; tokenId <= toTokenId; tokenId++) {
    const url = `https://testnets-api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}/?force_update=true`;
    const result = await axios.get(url);
    console.log(`Done with ${tokenId}`);
    console.log("🚀 result", result.data);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
