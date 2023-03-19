import * as Kilt from '@kiltprotocol/sdk-js'
import * as fs from "fs";
import {
  blake2AsU8a,
  keyExtractPath,
  keyFromPath,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  sr25519PairFromSeed
} from '@polkadot/util-crypto'

var mainAccount: Kilt.KiltKeyringPair
export function submitterAccount(): Kilt.KiltKeyringPair {
  if(!mainAccount) {
    const accountMnemonic = process.env.ATTESTER_ACCOUNT_MNEMONIC as string
    const { account } = generateAccount(accountMnemonic)
    mainAccount = account
  }
  return mainAccount
}

export async function saveJson(json: Object, file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(json), (err) => {
      if(err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

export function generateAccount(mnemonic = mnemonicGenerate()): {
  account: Kilt.KiltKeyringPair
  mnemonic: string
} {
  const keyring = new Kilt.Utils.Keyring({
    ss58Format: 38,
    type: 'sr25519'
  })
  return {
    account: keyring.addFromMnemonic(mnemonic) as Kilt.KiltKeyringPair,
    mnemonic
  }
}

function generateKeyAgreement(mnemonic: string) {
  const secretKeyPair = sr25519PairFromSeed(mnemonicToMiniSecret(mnemonic))
  const { path } = keyExtractPath('//did//keyAgreement//0')
  const { secretKey } = keyFromPath(secretKeyPair, path, 'sr25519')
  return Kilt.Utils.Crypto.makeEncryptionKeypairFromSeed(blake2AsU8a(secretKey))
}

export function generateKeypairs(mnemonic = mnemonicGenerate()) {
  const { account } = generateAccount(mnemonic)

  const authentication = {
    ...account.derive('//did//0'),
    type: 'sr25519'
  } as Kilt.KiltKeyringPair

  const assertionMethod = {
    ...account.derive('//did//assertion//0'),
    type: 'sr25519'
  } as Kilt.KiltKeyringPair

  const capabilityDelegation = {
    ...account.derive('//did//delegation//0'),
    type: 'sr25519'
  } as Kilt.KiltKeyringPair

  const keyAgreement = generateKeyAgreement(mnemonic)

  return {
    authentication: authentication,
    keyAgreement: keyAgreement,
    assertionMethod: assertionMethod,
    capabilityDelegation: capabilityDelegation
  }
}
