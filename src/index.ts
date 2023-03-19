import dotenv from 'dotenv';
import * as Kilt from '@kiltprotocol/sdk-js'

import { app } from "./app";
import { cryptoWaitReady } from "@polkadot/util-crypto";

dotenv.config();

async function startup() {
  await cryptoWaitReady();
  await Kilt.connect(process.env.WSS_ADDRESS as string)

  const port = process.env.PORT || 8080
  return new Promise((resolve) => {
    app.listen(port, () => {
      resolve( `[server]: Server is running at http://localhost:${port}`);
    })
  });
}

// Don't execute if this is imported by another file.
if (require.main === module) {
  startup().then(console.log).catch(console.error)
}
