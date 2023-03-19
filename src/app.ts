import express from "express";
import { createDid } from "./did/create-did";
import { getDidByWeb3Name, getDidDocument } from "./did/read-did";
import { DidUri } from "@kiltprotocol/sdk-js";

export const app = express();

// const dataPath = process.env.DATA_PATH

app.get("/", (req, res) => {
  res.writeHead(200);
  res.end(`health check at ${Date.now()} milliseconds \n`);
});

app.get("/did-doc/did/:uri", async (req, res) => {
  try {
    res.json(await getDidDocument(req.params.uri as DidUri));
  } catch (err: any) {
    console.error(JSON.stringify(err, null, 4), err.message)
    res.json({
      error: err.message,
      params: req.params
    })
  }
})

app.get("/did-doc/did/w3n/:web3Name", async (req, res) => {
  try {
    res.json(await getDidByWeb3Name(req.params.web3Name));
  } catch (err: any) {
    console.error(JSON.stringify(err, null, 4), err.message)
    res.json({
      error: err.message,
      params: req.params
    })
  }
})

app.post("/did", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    res.writeHead(200);
    const fullDid = await createDid();
    const didJson = JSON.stringify(fullDid);

    res.end(didJson);
  } catch (err: any) {
    res.writeHead(500);
    res.end(JSON.stringify(err));
  }
})
