//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract EvmeNFT is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint public constant RARE_LIMIT = 1;

    enum TierList{ t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10 }
    mapping(TierList => uint) public tierCounts;
    mapping(uint => TierList) public tokenTiers;
    mapping(uint => bool) public tokenBlackLists;

    string public baseTokenURI;

    constructor(string memory baseURI) ERC721("Evme NFT", "EVME") {
        setBaseURI(baseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function ownerMint(address receiver, TierList tier) public onlyOwner returns (uint tokenId) {
        require(tier != TierList.t0 , "Invalid Tier.");

        if (uint8(tier) > 5) {
          require(tierCounts[tier] < RARE_LIMIT , "Exceed Rare Limit.");
        }

        uint newTokenID = _tokenIds.current();
        _safeMint(receiver, newTokenID);

        // save token tier list
        tokenTiers[newTokenID] = tier;

        // tier count increment
        tierCounts[tier]++;

        _tokenIds.increment();

        return newTokenID;
    }

    function ownerMarkBlackList(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        tokenBlackLists[tokenId] = true;
    }

     function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory tierString;

        if (uint8(tokenTiers[tokenId]) == 1) tierString = "t1";
        if (uint8(tokenTiers[tokenId]) == 2) tierString = "t2";
        if (uint8(tokenTiers[tokenId]) == 3) tierString = "t3";
        if (uint8(tokenTiers[tokenId]) == 4) tierString = "t4";
        if (uint8(tokenTiers[tokenId]) == 5) tierString = "t5";
        if (uint8(tokenTiers[tokenId]) == 6) tierString = "t6";
        if (uint8(tokenTiers[tokenId]) == 7) tierString = "t7";
        if (uint8(tokenTiers[tokenId]) == 8) tierString = "t8";
        if (uint8(tokenTiers[tokenId]) == 9) tierString = "t9";
        if (uint8(tokenTiers[tokenId]) == 10) tierString = "t10";

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tierString))
            : '';
    }

    function tokensOfOwner(address _owner) external view returns (uint[] memory) {

        uint tokenCount = balanceOf(_owner);
        uint[] memory tokensId = new uint256[](tokenCount);

        for (uint i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }

    function renounceOwnership() public  virtual override  {
        // to prevent renouncing
        revert("Nothing Happened");
    }
}
