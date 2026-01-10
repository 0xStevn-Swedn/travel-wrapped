import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';

// Contract ABI (simplified - only the functions we need)
const CONTRACT_ABI = [
  {
    "inputs": [
      { "name": "tokenURI", "type": "string" },
      { "name": "totalTrips", "type": "uint256" },
      { "name": "totalDistance", "type": "uint256" },
      { "name": "citiesVisited", "type": "uint256" },
      { "name": "co2Emissions", "type": "uint256" },
      { "name": "year", "type": "uint256" }
    ],
    "name": "mintTravelWrapped",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getStats",
    "outputs": [
      {
        "components": [
          { "name": "totalTrips", "type": "uint256" },
          { "name": "totalDistance", "type": "uint256" },
          { "name": "citiesVisited", "type": "uint256" },
          { "name": "co2Emissions", "type": "uint256" },
          { "name": "year", "type": "uint256" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// For testing, we'll use Sepolia testnet
// You'll need to deploy the contract and update this address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

interface WindowWithEthereum extends Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
  };
}

declare const window: WindowWithEthereum;

export async function connectWallet(): Promise<{ address: string; signer: JsonRpcSigner } | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    alert('Please install MetaMask to use this feature!');
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { address, signer };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}

export async function switchToSepolia(): Promise<boolean> {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
    });
    return true;
  } catch (error: unknown) {
    // If chain not added, add it
    const switchError = error as { code?: number };
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'SEP', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
          }],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function mintNFT(
  signer: JsonRpcSigner,
  tokenURI: string,
  stats: {
    totalTrips: number;
    totalDistance: number;
    citiesVisited: number;
    co2Emissions: number;
    year: number;
  }
): Promise<{ tokenId: number; txHash: string } | null> {
  if (!CONTRACT_ADDRESS) {
    console.error('Contract address not configured');
    return null;
  }

  try {
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    const tx = await contract.mintTravelWrapped(
      tokenURI,
      stats.totalTrips,
      stats.totalDistance,
      stats.citiesVisited,
      stats.co2Emissions,
      stats.year
    );

    const receipt = await tx.wait();
    
    // Get tokenId from event logs
    const tokenId = receipt.logs[0]?.topics[3] 
      ? parseInt(receipt.logs[0].topics[3], 16) 
      : 0;

    return {
      tokenId,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error('Failed to mint NFT:', error);
    return null;
  }
}

export function isWalletConnected(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}