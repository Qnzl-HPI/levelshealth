#!/usr/bin/env node

const { URLSearchParams } = require('url')
const { promisify } = require('util')
const { resolve } = require('path')
const fetch = require('node-fetch')
const dayjs = require('dayjs')
const { Command } = require('commander')
const fs = require('fs')

const program = new Command()

process.on('unhandledRejection', onfatal)
process.on('uncaughtException', onfatal)

function onfatal(err) {
  console.log('fatal:', err.message)
  exit(1)
}

function exit(code) {
  process.nextTick(process.exit, code)
}

program
  .command('dump')
  .description('Dump to file')
  .option('-t, --token [token]', 'LunchMoney token')
  .option('--export-format <format>', 'Export file format', `{date}-lunchmoney.json`)
  .option('--export-path [path]', 'Export file path')
  .action(dump)

program.parseAsync(process.argv)

async function dump(args) {
  try {
    const {
      exportFormat,
      exportPath,
      token,
    } = args

    const filledExportFormat = exportFormat
      .replace(`{date}`, dayjs().format(`YYYY-MM-DD`))

    const EXPORT_PATH = resolve(exportPath, filledExportFormat)

    console.log("TOKEN:", token)

    const transactionRes = await fetch('https://dev.lunchmoney.app/v1/transactions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const transactions = await transactionRes.json()

    const assetRes = await fetch('https://dev.lunchmoney.app/v1/assets', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const assets = await assetRes.json()

    const plaidAccountRes = await fetch('https://dev.lunchmoney.app/v1/plaid_accounts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const plaidAccounts = await plaidAccountRes.json()

    const dump = JSON.stringify({
      transactions,
      assets,
      plaidAccounts,
    })

    await promisify(fs.writeFile)(EXPORT_PATH, dump)
  } catch (error) {
    console.log("Error: ", error)
  }
}
