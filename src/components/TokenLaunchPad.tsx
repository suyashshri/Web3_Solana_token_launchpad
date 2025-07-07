import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

const TokenLaunchPad = () => {
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [image, setImage] = useState<string>();
  const [initialSupply, setInitialSupply] = useState<string>();

  const wallet = useWallet();
  const { connection } = useConnection();

  async function createToken() {
    if (!wallet || !wallet.publicKey) {
      throw new Error("Please connect your wallet first");
    }
    const keypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: keypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        keypair.publicKey,
        6,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_PROGRAM_ID
      )
    );

    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;

    transaction.partialSign(keypair);
    await wallet.sendTransaction(transaction, connection);
  }
  return (
    <div
      style={{
        // height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      <h1>Solana Token Launchpad</h1>
      <input
        required
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <input
        required
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Symbol"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <input
        required
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Image Url"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <input
        required
        type="text"
        value={initialSupply}
        onChange={(e) => setInitialSupply(e.target.value)}
        placeholder="Initial Supply"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <button onClick={createToken}>Create a token</button>
    </div>
  );
};

export default TokenLaunchPad;
