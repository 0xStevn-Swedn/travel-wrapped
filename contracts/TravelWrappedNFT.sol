// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TravelWrappedNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Store travel stats on-chain
    struct TravelStats {
        uint256 totalTrips;
        uint256 totalDistance;
        uint256 citiesVisited;
        uint256 co2Emissions;
        uint256 year;
    }

    mapping(uint256 => TravelStats) public tokenStats;

    event TravelWrappedMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 totalTrips,
        uint256 totalDistance,
        uint256 year
    );

    constructor() ERC721("TravelWrapped", "TWRAP") Ownable(msg.sender) {}

    function mintTravelWrapped(
        string memory tokenURI,
        uint256 totalTrips,
        uint256 totalDistance,
        uint256 citiesVisited,
        uint256 co2Emissions,
        uint256 year
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        tokenStats[tokenId] = TravelStats({
            totalTrips: totalTrips,
            totalDistance: totalDistance,
            citiesVisited: citiesVisited,
            co2Emissions: co2Emissions,
            year: year
        });

        emit TravelWrappedMinted(
            msg.sender,
            tokenId,
            totalTrips,
            totalDistance,
            year
        );

        return tokenId;
    }

    function getStats(uint256 tokenId) public view returns (TravelStats memory) {
        return tokenStats[tokenId];
    }

    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}