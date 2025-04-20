import { useState } from "react";
import { Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl } from "@solana/web3.js";

export default function ClaimPage() {
  const [wallet, setWallet] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (window.solana?.isPhantom) {
      const resp = await window.solana.connect();
      setWallet(resp.publicKey.toString());
    } else {
      alert("Phantom wallet not detected!");
    }
  };

  const handleClaim = async () => {
    if (!wallet) return alert("Connect your wallet first");

    setLoading(true);
    setTxHash(null);

    try {
      const response = await fetch("https://167.71.160.224:3001/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });

      const result = await response.json();

      if (result.success) {
        setTxHash(result.tx);
      } else {
        alert("❌ Claim failed: " + result.error);
      }
    } catch (err) {
      alert("❌ Error processing claim.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">🎁 Claim Your ALPIR</h1>
        {!wallet ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
            onClick={connectWallet}
          >
            🔐 Connect Wallet
          </button>
        ) : (
          <div className="mb-4">
            <p className="text-green-400 text-sm break-all">Connected: {wallet}</p>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={!wallet || loading}
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          {loading ? "Processing..." : "✅ Claim Now"}
        </button>

        {txHash && (
          <div className="mt-4 text-sm text-green-300">
            ✅ Claimed! TX:{" "}
            <a
              href={`https://solscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {txHash.slice(0, 20)}...
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
