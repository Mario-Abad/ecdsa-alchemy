import { useState } from "react";
import server from "./server";

import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);
  
  const dataObj  = {
    sender: address,
    amount: parseInt(sendAmount),
    recipient,
  }

  async function transfer(evt) {
    evt.preventDefault();

    const sign = (privKey, message) => {

      const hash = keccak256(Uint8Array.from(message));
      const signature = secp.secp256k1.sign(hash, privKey);
      const compactSignature = signature.toCompactHex();

      return compactSignature;
    };
  
    const mySign = sign(privateKey, JSON.stringify(dataObj));
    dataObj['signature'] = mySign;
    //dataObj['recipient'] = "02c83d690b62972dee92494491ca15901c4f08290bb429432996329b431ba24f25";

    try {

      const {
        data: { balance },
      } = await server.post(`send`, 
        dataObj
      );

      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Sign and Transfer" />
    </form>
  );
}

export default Transfer;
