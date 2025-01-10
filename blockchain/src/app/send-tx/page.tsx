"use client";

import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { getAddress, parseEther } from "ethers";

export default function SendTransaction() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    sendTransaction,
    isPending,
    isError,
    data,
    error: txError,
  } = useSendTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const cleanedRecipient = getAddress(recipient.trim());

      setLoading(true);
      await sendTransaction({
        to: cleanedRecipient as `0x${string}`,
        value: parseEther(amount || "0"),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Send Transaction</h2>
      {!isConnected && <p>Please connect your wallet first.</p>}

      {isConnected && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="recipient">Recipient Address:</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="amount">Amount (ETH):</label>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading || isPending}>
            {loading || isPending ? "Sending..." : "Send"}
          </button>
        </form>
      )}

      {isError && (
        <p style={{ color: "red" }}>
          Error: {txError?.message || "Transaction failed"}
        </p>
      )}
      {data && (
        <p>
          Transaction sent successfully! Hash:{" "}
          <a
            href={`https://etherscan.io/tx/${data}`}
            target="_blank"
            rel="noopener noreferrer">
            {data}
          </a>
        </p>
      )}
    </div>
  );
}
