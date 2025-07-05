const TokenLaunchPad = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      <h1>Solana Token Launchpad</h1>
      <input
        type="text"
        placeholder="Name"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <input
        type="text"
        placeholder="Symbol"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <input
        type="text"
        placeholder="Image Url"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <input
        type="text"
        placeholder="Initial Supply"
        style={{ padding: "8px", marginBottom: "10px", width: "200px" }}
      />
      <button>Create a token</button>
    </div>
  );
};

export default TokenLaunchPad;
