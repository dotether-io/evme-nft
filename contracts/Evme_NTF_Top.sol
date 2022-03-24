//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract EvmeNFTTop is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint public constant MAX_SUPPLY = 25;
    uint public constant MAX_PER_DESIGN = 5;
    enum Design{ d0, d1, d2, d3, d4, d5 }
    mapping(Design => uint) public designCounts;
    mapping(uint => Design) public tokenIdToDesign;

    string public baseTokenURI;

    constructor(string memory baseURI) ERC721("EVme NFT Top", "EVmeTOP") {
        setBaseURI(baseURI);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function ownerMint(address receiver, Design series) public onlyOwner returns (uint tokenId) {
        require(series != Design.d0 , "Invalid Design.");

        uint newTokenID = _tokenIds.current();

        require(newTokenID < MAX_SUPPLY, "Reached the maximum number of NFTs");

        require(designCounts[series] < MAX_PER_DESIGN, "Reached the maximum number of NFTs in this Design");

        _safeMint(receiver, newTokenID);

        // save token series list
        tokenIdToDesign[newTokenID] = series;

        // series count increment
        designCounts[series]++;

        _tokenIds.increment();

        return newTokenID;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory tierString;

        if (uint8(tokenIdToDesign[tokenId]) == 1) tierString = "d1";
        if (uint8(tokenIdToDesign[tokenId]) == 2) tierString = "d2";
        if (uint8(tokenIdToDesign[tokenId]) == 3) tierString = "d3";
        if (uint8(tokenIdToDesign[tokenId]) == 4) tierString = "d4";
        if (uint8(tokenIdToDesign[tokenId]) == 5) tierString = "d5";

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, tierString))
            : '';
    }

    function tokensOfOwner(address _owner) public view returns (uint[] memory) {

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
