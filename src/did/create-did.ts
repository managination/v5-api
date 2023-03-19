import * as Kilt from '@kiltprotocol/sdk-js'
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { generateKeypairs, submitterAccount } from "../utilities";

export async function createDid() : Promise<{
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
        authentication: [authentication],
        keyAgreement: [keyAgreement],
        assertionMethod: [assertionMethod],
        capabilityDelegation: [capabilityDelegation]
      },
      submitterAccount().address,
      async ({ data }) => ({
        signature: authentication.sign(data),
        keyType: authentication.type
      })
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
