import { useEffect, useState } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

const END_DATE = new Date("2025-06-30T23:59:59Z").getTime();
const WALLET_RECEIVER = "5ra5JPQwtwS8kWxLgDxXZBeFWNJGppdLX4psjDygWD2n";
const RATE = 5000000;
const TARGET_SOL = 200;
const CURRENT_SOL = 5;

export default function Presale() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [solAmount, setSolAmount] = useState(0);
  const [alpirAmount, setAlpirAmount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = END_DATE - now;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const connectWallet = async () => {
    if (window?.solana?.isPhantom) {
      try {
        const resp = await window.solana.connect();
        setWalletAddress(resp.publicKey.toString());
        setWalletConnected(true);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Phantom Wallet not found.");
    }
  };

  const handleChange = (e) => {
    const value = parseFloat(e.target.value);
    setSolAmount(value);
    setAlpirAmount(value * RATE);
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      setTxHash(null);
      const provider = window.solana;
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(WALLET_RECEIVER),
          lamports: solAmount * LAMPORTS_PER_SOL,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);
      const signed = await provider.signTransaction(transaction);
      const sig = await connection.sendRawTransaction(signed.serialize());
      setTxHash(sig);
      alert(`✅ Success! TX: https://solscan.io/tx/${sig}`);
    } catch (err) {
      console.error(err);
      alert("❌ Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const progress = (CURRENT_SOL / TARGET_SOL) * 100;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold text-white leading-tight">🚀 ALPIR Token Presale</h1>
          <p className="text-gray-400 text-lg">
            Join the presale now. All SOL raised goes directly to liquidity. No team tokens, no rug.
          </p>

          <div className="text-sm text-gray-300">
            ⏳ Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4 shadow-xl">
            <p>🎯 <strong>Target:</strong> 200 SOL</p>
            <p>📈 <strong>Rate:</strong> 1 SOL = 5,000,000 ALPIR</p>
            <p className="text-sm text-gray-400">💧 All presale proceeds go to liquidity</p>

            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-right text-gray-400">{CURRENT_SOL} / {TARGET_SOL} SOL Raised</p>

            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-400">Wallet: {WALLET_RECEIVER}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(WALLET_RECEIVER);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
              >
                📋 {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="bg-green-600 hover:bg-green-500 w-full py-3 rounded-lg font-bold text-lg transition hover:scale-105"
              >
                🔐 Connect Phantom Wallet
              </button>
            ) : (
              <>
                <p className="text-sm text-gray-400">Connected: {walletAddress}</p>
                <input
                  type="number"
                  value={solAmount}
                  onChange={handleChange}
                  className="w-full p-2 text-black rounded mb-2"
                  placeholder="Enter SOL amount"
                />
                <p className="text-sm mb-4 text-gray-400">
                  You'll receive: <strong>{alpirAmount.toLocaleString()} ALPIR</strong>
                </p>
                <button
                  onClick={handleBuy}
                  className="bg-blue-600 hover:bg-blue-500 w-full py-3 rounded-lg font-bold text-lg transition hover:scale-105"
                >
                  🚀 {loading ? "Processing..." : "Buy ALPIR Now"}
                </button>
                {txHash && (
                  <p className="text-green-400 text-sm mt-2">
                    ✅ TX: <a href={`https://solscan.io/tx/${txHash}`} target="_blank" className="underline">
                      {txHash.slice(0, 24)}...
                    </a>
                  </p>
                )}
              </>
            )}
          </div>

          <p className="text-sm text-gray-500">
            🗓 Presale: 26 Apr – 30 Jun 2025 | 💸 Distribution within 24h
          </p>
        </div>

        <div className="text-center">
          <img src="/tapirsamurai.png" alt="Tapir Samurai" className="rounded-2xl shadow-2xl w-full hover:scale-105 transition" />
        </div>
      </div>

      <footer className="text-center mt-16 text-gray-500 text-sm relative z-10">
        Follow us:
        <div className="flex justify-center gap-4 mt-2">
          <a href="https://x.com/tapirmeme" target="_blank" rel="noopener noreferrer" className="hover:text-white">🐦 Twitter</a>
          <a href="https://t.me/tapirmeme" target="_blank" rel="noopener noreferrer" className="hover:text-white">📢 Telegram</a>
        </div>
      </footer>
    </div>
  );
}
