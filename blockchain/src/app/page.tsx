"use client";

import { useAccount, useConnect, useDisconnect, usePublicClient } from "wagmi";
import { useState } from "react";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const [chainInfo, setChainInfo] = useState<{
    blockNumber: number | null;
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
        blockNumber: latestBlock.number,
        blockHash: latestBlock.hash,
        gasUsed: latestBlock.gasUsed.toString(),
        gasPrice: gasPrice.toString(),
        burntFees: burntFees.toString(),
      });
    } catch (error) {
      console.error("Error fetching chain info:", error);
    }
  };

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          Status: {account.status}
          <br />
          Address: {account.address ?? "Not connected"}
          <br />
          Chain ID: {account.chain?.id ?? "Not available"}
        </div>

        {account.status === "connected" && (
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

      {account.status === "connected" && (
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
            </ul>
          )}
        </div>
      )}
    </>
  );
}

export default App;
