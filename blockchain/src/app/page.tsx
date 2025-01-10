"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
} from "wagmi";
import { useState, useEffect } from "react";
import Link from "next/link";

function App() {
  const { address, chain, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { switchChain, error: switchError } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);

  const [chainInfo, setChainInfo] = useState<{
    blockNumber: bigint | null;
    blockHash: string | null;
    gasUsed: string | null;
    gasPrice: string | null;
    burntFees: string | null;
  }>({
    blockNumber: null,
    blockHash: null,
    gasUsed: null,
    gasPrice: null,
    burntFees: null,
  });

  const fetchChainInfo = async () => {
    if (!publicClient) return;

    try {
      const latestBlock = await publicClient.getBlock();
      const gasPrice = await publicClient.getGasPrice();
      const burntFees = latestBlock.baseFeePerGas
        ? BigInt(latestBlock.baseFeePerGas) * BigInt(latestBlock.gasUsed)
        : "N/A";

      setChainInfo({
        blockNumber: BigInt(latestBlock.number),
        blockHash: latestBlock.hash,
        gasUsed: latestBlock.gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        burntFees: burntFees.toString(),
      });
    } catch (error) {
      console.error("Error fetching chain info:", error);
    }
  };

  useEffect(() => {
    if (chain && chain.id !== 1 && chain.id !== 11155111) {
      alert(
        `You are connected to the wrong chain (ID: ${chain.id}). Please switch to Ethereum Mainnet or Sepolia.`
      );
    }
  }, [chain]);

  const handleSwitchChain = async (chainId: 1 | 11155111) => {
    setIsSwitching(true);
    try {
      await switchChain({ chainId });
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          Status: {isConnected ? "Connected" : "Not connected"}
          <br />
          Address: {address ?? "Not connected"}
          <br />
          Chain ID: {chain?.id ?? "Not available"}
        </div>

        {isConnected && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            type="button">
            {connector.name}
          </button>
        ))}
        <div>Status: {status}</div>
        <div>Error: {error?.message}</div>
      </div>

      {isConnected && (
        <div>
          <h2>Chain Info</h2>
          <button onClick={fetchChainInfo} type="button">
            Fetch Chain Info
          </button>
          {chainInfo.blockNumber !== null && (
            <ul>
              <li>
                <strong>Last Block Number:</strong> {chainInfo.blockNumber}
              </li>
              <li>
                <strong>Latest Block Hash:</strong> {chainInfo.blockHash}
              </li>
              <li>
                <strong>Gas Used:</strong> {chainInfo.gasUsed}
              </li>
              <li>
                <strong>Gas Price (wei):</strong> {chainInfo.gasPrice}
              </li>
              <li>
                <strong>Burnt Fees (wei):</strong> {chainInfo.burntFees}
              </li>
              <li>
                <Link href="/send-tx">Send Transaction</Link>
              </li>
            </ul>
          )}

          {chain && (
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={() => handleSwitchChain(1)}
                disabled={isSwitching || chain.id === 1}>
                {chain.id === 1 ? "On Mainnet" : "Switch to Mainnet"}
              </button>
              <button
                onClick={() => handleSwitchChain(11155111)}
                disabled={isSwitching || chain.id === 11155111}>
                {chain.id === 11155111 ? "On Sepolia" : "Switch to Sepolia"}
              </button>
              {switchError && (
                <p style={{ color: "red" }}>
                  Unable to switch chain: {switchError.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
