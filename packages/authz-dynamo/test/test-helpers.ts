import {readFileSync} from "fs";

export function getAuthZDefs(filename: string) {
  return readFileSync(`./packages/authz-dynamo/test/${filename}`, {encoding: 'utf-8'})
}