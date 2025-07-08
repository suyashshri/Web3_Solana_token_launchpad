import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  getMintLen,
  LENGTH_SIZE,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";

const TokenLaunchPad = () => {
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [image, setImage] = useState<string>();
  const [initialSupply, setInitialSupply] = useState<string>();

  const wallet = useWallet();
  const { connection } = useConnection();

  async function createToken() {
    if (!wallet || !wallet.publicKey || !name || !symbol || !initialSupply) {
      throw new Error("Please connect your wallet first");
    }
    const keypair = Keypair.generate();

    const metadata = {
      mint: keypair.publicKey,
      name: name,
      symbol: symbol,
      uri: "https://cdn.100xdevs.com/metadata.json",
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    console.log("mintLen", mintLen);

    console.log("TYPE_SIZE", TYPE_SIZE);
    console.log("LENGTH_SIZE", LENGTH_SIZE);
    console.log("pack(metadata).length", pack(metadata).length);

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    console.log("metadataLen", metadataLen);

    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: keypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        keypair.publicKey,
        wallet.publicKey,
        keypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMint2Instruction(
        keypair.publicKey,
        6,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: keypair.publicKey,
        updateAuthority: wallet.publicKey,
        mint: keypair.publicKey,
        mintAuthority: wallet.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
      })
    );

    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;

    transaction.partialSign(keypair);
    await wallet.sendTransaction(transaction, connection);

    console.log(`Token mint created at ${keypair.publicKey.toBase58()}`);

    const associatedToken = getAssociatedTokenAddressSync(
      keypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    console.log(associatedToken.toBase58());

    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        wallet.publicKey,
        keypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction2, connection);

    const transaction3 = new Transaction().add(
      createMintToInstruction(
        keypair.publicKey,
        associatedToken,
        wallet.publicKey,
        parseInt(initialSupply),
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction3, connection);

    console.log("Minted!");
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
