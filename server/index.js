const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
//Public Keys
  "0386fb07dfa4b06ed3dc23736b7fdceb67bbd69c9d70a10141668f8d88642185de": 100,
  "03632fedee3662016bcadcc4ad0cfad0d4b03d538838be41eb93de038e9b28dfd1": 50,
  "02c83d690b62972dee92494491ca15901c4f08290bb429432996329b431ba24f25": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);
  
  const dataObj = {
    sender: sender,
    amount: amount,
    recipient,
  }
  
  const hash = keccak256(Uint8Array.from(JSON.stringify(dataObj)));
  const isValid = secp.secp256k1.verify(signature, hash, sender);
  //console.log("Valid? ", isValid);

  if (!isValid){
    res.status(400).send({ message: "Signature no valid" });
  } else if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
