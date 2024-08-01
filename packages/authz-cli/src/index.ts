#!/usr/bin/env node

import {program} from "commander";
import {readFileSync} from "fs";
import {buildAst} from "@contexts-authz/authz-grammar";
import {AuthzModel} from "@contexts-authz/authz-grammar";
import {AuthZTypesGenerator} from "./codegen/AuthZTypesGenerator";
import {cosmiconfigSync} from "cosmiconfig";
import _ from "lodash";
import * as fs from "fs";

/* eslint no-console: 0 */

export type AuthzCodegenConfig = {
  overwrite: boolean;
  schema: string;
  generates: {
    //eslint-disable-next-line @typescript-eslint/no-empty-object-type
    [output: string]: {
      //empty
    }
  }
}

program
    .name('authz-codegen')
    .option('--config <file name>', 'Path to authz config file', 'authz-codegen.config.ts')
    .action(runScript)

program.parse(process.argv)

async function runScript() {
  const configFile = program.opts().config

  if (!configFile || !(typeof configFile === 'string')) {
    console.error('Config file option is required')
    process.exit(1)
  }

  const workingDir = process.cwd()

  const explorer = cosmiconfigSync('authz-codegen')
  const result = explorer.load(configFile)

  if (!result || !result.config) {
    console.error(`Failed to load ${configFile}`)
    process.exit(1)
  }

  const config: AuthzCodegenConfig = result.config

  const filePath = (path: string) => {
    if (path.startsWith('./')) {
      return `${workingDir}/${path}`
    }
    return path
  }

  const authzSchemaString = readFileSync(filePath(config.schema), {encoding: 'utf-8'})

  const modelAst: AuthzModel = buildAst(authzSchemaString)

  const codeGenerator = new AuthZTypesGenerator(modelAst)

  console.log(`✔️ Successfully parsed AuthZ schema: ${modelAst.definitions.length} definitions found.`)
  console.log(`🚀 Generating code...`)

  const code = codeGenerator.generate()
  _.keys(config.generates).forEach((path) => {
    try {
      fs.writeFileSync(filePath(path), code, {flag: config.overwrite ? 'w' : 'wx'})
    } catch (e) {
      console.error(`❌ Error writing to file: ${path}`, e)
    }
  })

  console.log(`🎉 Done!`)
}


