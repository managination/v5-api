import * as Kilt from '@kiltprotocol/sdk-js'
import {
  Blockchain,
  Did,
  DidResourceUri,
  ISubmittableResult,
  KiltKeyringPair,
  SignRequestData,
  SubmittableExtrinsic
} from '@kiltprotocol/sdk-js'
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { generateKeypairs, submitterAccount } from "../utilities";
import BN from "bn.js";

export async function createDid(): Promise<{
  mnemonic: string
  fullDid: Kilt.DidDocument
}> {
  const api = Kilt.ConfigService.get('api')
  const mnemonic = mnemonicGenerate()
  const {
    authentication,
    keyAgreement,
    assertionMethod,
    capabilityDelegation
  } = generateKeypairs(mnemonic)
  // Get tx that will create the DID on chain and DID-URI that can be used to resolve the DID Document.
  const fullDidCreationTx = await Kilt.Did.getStoreTx(
      {
        authentication: [ authentication ],
        keyAgreement: [ keyAgreement ],
        assertionMethod: [ assertionMethod ],
        capabilityDelegation: [ capabilityDelegation ]
      },
      submitterAccount().address,
      async ({ data }) => ( {
        signature: authentication.sign(data),
        keyType: authentication.type
      } )
  )

  await Kilt.Blockchain.signAndSubmitTx(fullDidCreationTx, submitterAccount())

  const didUri = Kilt.Did.getFullDidUriFromKey(authentication)
  const encodedFullDid = await api.call.did.query(Kilt.Did.toChain(didUri))
  const { document } = Kilt.Did.linkedInfoFromChain(encodedFullDid)

  if (!document) {
    throw new Error('Full DID was not successfully created.')
  }

  return { mnemonic, fullDid: document }

}

export async function createW3n(
    didMnemonic: string,
    web3Name: string
) {
  const api = Kilt.ConfigService.get('api')
  const account: Kilt.KiltKeyringPair = submitterAccount()
  const { authentication: didAuth } = generateKeypairs(didMnemonic)
  const didUri = Kilt.Did.getFullDidUriFromKey(didAuth)

  const authorized = await Did.authorizeTx(
      didUri,
      api.tx.web3Names.claim(web3Name),
      async (signRequest: SignRequestData) => {
        const signature = didAuth.sign(signRequest.data, { withType: false });
        const keyUri = `${didUri}:${didAuth.address}` as DidResourceUri;
        const keyType = didAuth.type;

        return {
          signature,
          keyUri,
          keyType,
        };
      },
      account.address
  );
  const tx = await submitTx(account, authorized);
  await tx.finalizedPromise
}

export async function submitTx(
    keypair: KiltKeyringPair,
    draft: SubmittableExtrinsic,
    tip = new BN(0),
): Promise<{
  txHash: string;
  finalizedPromise: Promise<ISubmittableResult>;
}> {
  const extrinsic = await draft.signAsync(keypair, { tip });
  const txHash = extrinsic.hash.toHex();
  const finalizedPromise = Blockchain.submitSignedTx(extrinsic);

  return {
    txHash,
    finalizedPromise,
  };
}
