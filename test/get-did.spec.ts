import dotenv from "dotenv";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import * as Kilt from "@kiltprotocol/sdk-js";
import { getDidByWeb3Name } from "../src/did/read-did";

dotenv.config();

describe("read DID from chain", function () {
  beforeAll(async () => {
    await cryptoWaitReady();
    await Kilt.connect(process.env.WSS_ADDRESS as string);
  })

  afterAll(async () => {
    await Kilt.disconnect()
  })

  it("reads an existing DID document by web3 name", async function () {
    const didDocument = await getDidByWeb3Name("verifive");
    expect(didDocument.web3Name).toEqual("verifive");
  })
})
