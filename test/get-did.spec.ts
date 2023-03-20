import dotenv from "dotenv";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Crypto } from '@kiltprotocol/utils'
import { getDidByWeb3Name, getDidDocument } from "../src/did/read-did";
import { createDid, createW3n } from "../src/did/create-did";
import { Blockchain, connect, DidDocument, disconnect } from "@kiltprotocol/sdk-js";
import { submitterAccount } from "../src/utilities";
import { randomUUID } from "crypto";

dotenv.config({path: "./.env-test"});

describe("create and read DID", function () {
  jest.setTimeout(300000);

  beforeAll(async () => {
    await cryptoWaitReady();
    const api = await connect(process.env.WSS_ADDRESS as string);
    const faucetSeed = "receive clutch item involve chaos clutch furnace arrest claw isolate okay together"
    // creates an ed25519 key by default
    const devFaucet = Crypto.makeKeypairFromUri(faucetSeed)
    const account = submitterAccount()
    const transferTx = api.tx.balances.transfer(account.address, "10000000000000000")
    await Blockchain.signAndSubmitTx(transferTx, devFaucet)
  })

  afterAll(async () => {
    await disconnect()
  })

  it("allows any user to create a DID", async function() {
    const account = await createDid()
    const did = await getDidDocument(account.fullDid.uri)
    expect(account.fullDid.authentication).toEqual(did.document?.authentication)
  })

  describe("web3 names", function (){
    var web3Name: string
    var account: {mnemonic: string, fullDid: DidDocument}

    beforeEach(async function() {
      account = await createDid()
      web3Name = randomUUID().substring(1, 32)
    })

    it.only("assigns a web3 name to a DID", async function() {
      await createW3n(account.mnemonic, web3Name)
      const didDocument = await getDidByWeb3Name(web3Name);
      expect(didDocument.web3Name).toEqual(web3Name);
    })

    it("fails to read a non existing web3 name DID document", async function () {
      try {
        await getDidByWeb3Name(web3Name);
        throw new Error("getWeb3Name should have thrown")
      } catch (err: any) {
        expect(err.message).toEqual(`web3Name ${web3Name} is not assigned`)
      }
    })
  })
})
