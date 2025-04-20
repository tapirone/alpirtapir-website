import { useEffect, useState } from "react";

export default function Claim() {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleConnect = async () => {
    if ("solana" in window) {
      const resp = await window.solana.connect();
      setWallet(resp.publicKey.toString());
    } else {
      alert("Phantom Wallet not found!");
    }
  };

  const handleClaim = async () => {
    setStatus("Processing...");
    setTxHash("");

    const response = await fetch("http://167.71.160.224:3001/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    });

    const data = await response.json();
    if (response.ok) {
      setStatus("✅ Claim successful!");
      setTxHash(data.txHash);
    } else {
      setStatus("❌ " + data.error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Claim Your ALPIR</h1>
      {wallet ? (
        <p>Wallet: {wallet}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
      <br /><br />
      <button onClick={handleClaim} disabled={!wallet}>
        Claim ALPIR
      </button>
      <p>{status}</p>
      {txHash && (
        <p>
          TX: <a href={`https://solscan.io/tx/${txHash}`} target="_blank">{txHash}</a>
        </p>
      )}
    </div>
  );
}
