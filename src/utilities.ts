import * as fs from "fs";

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
