import logo from './logo.svg';
import './App.css';
// connect wallet => get currently connected account(s), the current chain
// handle account switching
// handle chain switching
// add custom chain that can be switched to
// connect eagerly

function App() {
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [isActive, setIsActive] = useState(false);
  const supportedChain = 8453;

  const connectWallet = async () => {
      try {
          return window.ethereum.request({
              method: "eth_requestAccounts",
          });
      } catch (error) {
          console.log("error: ", error);
      }
  };

  const handleAccountChanged = async (accounts) => {
      if (!accounts.length) {
          setAccount(undefined);
          setChainId(undefined);
          setIsActive(false);
          return;
      }
      const chain = await window.ethereum.request({
          method: "eth_chainId",
      });

      setAccount(accounts[0]);
      setChainId(chain);
      if (Number(chain) === supportedChain) {
          setIsActive(true);
      } else {
          setIsActive(false);
      }
  };

  const handleChainChanged = (chain) => {
      setChainId(chain);
      if (Number(chain) === supportedChain) {
          setIsActive(true);
      } else {
          setIsActive(false);
      }
  };

  const eagerlyConnect = async () => {
      const accounts = await window.ethereum.request({
          method: "eth_accounts",
      });

      if (!accounts.length) return;

      handleAccountChanged(accounts);
  };

  useEffect(() => {
      eagerlyConnect();
      window.ethereum.on("chainChanged", handleChainChanged);

      window.ethereum.on("accountsChanged", handleAccountChanged);

      return () => {
          window.ethereum.removeListener(
              "accountsChanged",
              handleAccountChanged
          );

          window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
  }, []);

  const switchToChain = async (chain) => {
      try {
          await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${chain.toString(16)}` }],
          });
      } catch (error) {
          if (error.code === 4902 || error.code === -32603) {
              try {
                  await window.ethereum.request({
                      method: "wallet_addEthereumChain",
                      params: [
                          {
                              chainId: `0x${chain.toString(16)}`,
                              chainName: "Base",
                              rpcUrls: ["https://mainnet.base.org/"],
                              blockExplorerUrls: ["https://basescan.org/"],
                              nativeCurrency: {
                                  name: "ETH",
                                  symbol: "ETH",
                                  decimals: 18,
                              },
                          },
                      ],
                  });
              } catch (addError) {
                  // handle "add" error
              }
          }
      }
  };

  return (
      <div className="App">
          {!account && <button onClick={connectWallet}>connect</button>}
          <p>Account: {account ?? "undefined"}</p>
          <p>chainId: {chainId ?? "undefined"}</p>
          <p>on the right chain: {String(isActive)}</p>
          {!isActive && (
              <button onClick={() => switchToChain(supportedChain)}>
                  switch to ethereum mainnet
              </button>
          )}
      </div>
  );
}



export default App;
