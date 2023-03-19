import * as Kilt from '@kiltprotocol/sdk-js'
import { DidResolutionResult, DidUri } from '@kiltprotocol/sdk-js'
import { DidInfo } from "@kiltprotocol/did"

export async function getDidByWeb3Name(web3Name: string): Promise<DidInfo> {
  const api = Kilt.ConfigService.get('api')
  const encodedDidForWeb3Name = await api.call.did.queryByWeb3Name(web3Name)

  if (encodedDidForWeb3Name.initialU8aLength) {
    return  Kilt.Did.linkedInfoFromChain(encodedDidForWeb3Name)
  }

  throw new Error(`web3Name ${web3Name} is not assigned`)
}

export async function getDidDocument(uri: DidUri): Promise<DidResolutionResult> {
  const resolution = await Kilt.Did.resolve(uri)
  if (resolution) {
    const { metadata, document } = resolution
    if (metadata.deactivated) {
      throw new Error(`${uri} has been deleted`)
    } else if (document === undefined) {
      throw new Error(`DID ${uri} does not exist.`)
    } else {
      return resolution
    }
  }
  throw new Error(`DID ${uri} does not exist.`)
}

export async function getWeb3NameForDid(uri: DidUri): Promise<string> {
  return (await getDidDocument(uri)).web3Name || ""
}
