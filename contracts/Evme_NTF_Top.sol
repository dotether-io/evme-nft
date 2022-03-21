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
    uint public constant MAX_PER_SERIES = 5;
    enum Series{ s0, s1, s2, s3, s4, s5 }
    mapping(Series => uint) public seriesCounts;
    mapping(uint => Series) public tokenIdToSeries;

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

    function ownerMint(address receiver, Series series) public onlyOwner returns (uint tokenId) {
        require(series != Series.s0 , "Invalid Series.");

        uint newTokenID = _tokenIds.current();

        require(newTokenID < MAX_SUPPLY, "Reached the maximum number of NFTs");

        require(seriesCounts[series] < MAX_PER_SERIES, "Reached the maximum number of NFTs in this Series");

        _safeMint(receiver, newTokenID);

        // save token series list
        tokenIdToSeries[newTokenID] = series;

        // series count increment
        seriesCounts[series]++;

        _tokenIds.increment();

        return newTokenID;
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
