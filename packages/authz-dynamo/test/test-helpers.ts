import {readFileSync} from "fs";

export function getAuthZDefs(filename: string) {
  return readFileSync(`./packages/authz-grammar/test/permissions/grammar/${filename}`, {encoding: 'utf-8'})
}