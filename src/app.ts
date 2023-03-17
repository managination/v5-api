import express from "express";

export const app = express();

const dataPath = process.env.DATA_PATH

app.get("/", (req, res) => {
  res.writeHead(200);
  res.end(`health check at ${Date.now()} milliseconds \n`);
});

app.get("/did-doc/did/:did", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  const didDoc = {
    did: req.params.did,
    fake: "just a string"
  }
  res.end(JSON.stringify(didDoc));
})

app.get("/did-doc/w3n/:web3Name", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  const didDoc = {
    web3Name: req.params.web3Name,
    fake: "just a string"
  }
  res.end(JSON.stringify(didDoc));
})

