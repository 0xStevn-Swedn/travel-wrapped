'use client';

import { useState } from 'react';
import { Trip } from '@/types/trip';
import { calculateStats, calculateCarbonFootprint } from '@/lib/utils';
import { connectWallet, switchToSepolia, mintNFT, isWalletConnected } from '@/lib/web3';
import { JsonRpcSigner } from 'ethers';

interface MintNFTProps {
  trips: Trip[];
}

type MintStatus = 'idle' | 'connecting' | 'switching' | 'minting' | 'success' | 'error';

export default function MintNFT({ trips }: MintNFTProps) {
  const [status, setStatus] = useState<MintStatus>('idle');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (trips.length === 0) {
    return null;
  }

  const stats = calculateStats(trips);
  const carbon = calculateCarbonFootprint(trips);

  const handleMint = async () => {
    setError(null);
    setTxHash(null);

    if (!isWalletConnected()) {
      setError('Please install MetaMask to mint NFTs');
      return;
    }

    setStatus('connecting');
    const wallet = await connectWallet();
    
    if (!wallet) {
      setError('Failed to connect wallet');
      setStatus('error');
      return;
    }

    setWalletAddress(wallet.address);

    setStatus('switching');
    const switched = await switchToSepolia();
    
    if (!switched) {
      setError('Please switch to Sepolia testnet');
      setStatus('error');
      return;
    }

    const metadata = {
      name: 'Travel Wrapped ' + new Date().getFullYear(),
      description: stats.totalTrips + ' trips, ' + stats.totalDistance.toLocaleString() + ' km traveled',
      attributes: [
        { trait_type: 'Total Trips', value: stats.totalTrips },
        { trait_type: 'Total Distance (km)', value: stats.totalDistance },
        { trait_type: 'Cities Visited', value: stats.citiesVisited.length },
        { trait_type: 'CO2 Emissions (kg)', value: carbon.totalCO2 },
        { trait_type: 'Year', value: new Date().getFullYear() },
      ],
    };

    const tokenURI = 'data:application/json;base64,' + btoa(JSON.stringify(metadata));

    setStatus('minting');
    const result = await mintNFT(wallet.signer as JsonRpcSigner, tokenURI, {
      totalTrips: stats.totalTrips,
      totalDistance: stats.totalDistance,
      citiesVisited: stats.citiesVisited.length,
      co2Emissions: carbon.totalCO2,
      year: new Date().getFullYear(),
    });

    if (result) {
      setTxHash(result.txHash);
      setStatus('success');
    } else {
      setError('Failed to mint NFT. Make sure you have Sepolia ETH.');
      setStatus('error');
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'connecting': return 'Connecting Wallet...';
      case 'switching': return 'Switching Network...';
      case 'minting': return 'Minting...';
      case 'success': return 'Minted!';
      default: return 'Mint as NFT';
    }
  };

  const etherscanUrl = txHash ? 'https://sepolia.etherscan.io/tx/' + txHash : '';

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-lg shadow-lg text-white">
      <h3 className="font-bold text-lg mb-2">Mint Your Travel Wrapped</h3>
      <p className="text-sm opacity-90 mb-4">
        Save your travel stats forever on the blockchain as an NFT.
      </p>

      {walletAddress && (
        <p className="text-xs opacity-75 mb-3 truncate">
          Wallet: {walletAddress}
        </p>
      )}

      <button
        onClick={handleMint}
        disabled={status === 'connecting' || status === 'switching' || status === 'minting'}
        className="w-full bg-white text-orange-600 font-semibold py-3 px-4 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>

      {error && (
        <p className="mt-3 text-sm bg-red-500/30 p-2 rounded">{error}</p>
      )}

      {txHash && (
        <div className="mt-3 text-sm">
          <p className="opacity-90">Transaction successful!</p>
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs opacity-75 break-all"
          >
            View on Etherscan
          </a>
        </div>
      )}

      <p className="text-xs opacity-50 mt-4">
        Uses Sepolia testnet. Get free test ETH from a faucet.
      </p>
    </div>
  );
}