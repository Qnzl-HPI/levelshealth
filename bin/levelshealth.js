#!/usr/bin/env node

const { URLSearchParams } = require('url')
const { promisify } = require('util')
const { resolve } = require('path')
const { Command } = require('commander')
const LevelsHealth = require('levels-health-unofficial')
const dayjs = require('dayjs')
const fs = require('fs')

const levels = new LevelsHealth()

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
  .command('authenticate')
  .description('Authenticate with Levels Health')
  .option('-e, --email [email]', 'Email')
  .option('-p, --password [password]', 'Password')
  .action(authenticate)

program
  .command('dump')
  .description('Dump to file')
  .option('-t, --token [token]', 'Levels Health JWT token')
  .option('--export-format <format>', 'Export file format', `{date}-levelshealth.json`)
  .option('--export-path [path]', 'Export file path')
  .action(dump)

program.parseAsync(process.argv)


async function authenticate(args) {
  try {
    const {
      email,
      password,
    } = args

    const token = await levels.login(email, password)

    process.stdout.write(token)
  } catch (error) {
    console.log("Error occurred authenticating:", error)
  }
}

async function dump(args) {
  try {
    const {
      exportFormat,
      exportPath,
      token,
    } = args

    // Manual set token on the class since we aren't logging in again
    levels.token = token

    const filledExportFormat = exportFormat
      .replace(`{date}`, dayjs().format(`YYYY-MM-DD`))

    const EXPORT_PATH = resolve(exportPath, filledExportFormat)

    const sevenDaysAgo = dayjs().subtract(7, 'days').valueOf()
    const tomorrow = dayjs().add(1, 'days').valueOf()

    const rawGlucose = await levels.glucoseHistory(sevenDaysAgo, tomorrow)
    const zones = await levels.findZones(sevenDaysAgo, tomorrow)
    const streaks = await levels.metabolicFitnessStreaks(sevenDaysAgo, tomorrow)
    const heartRate = await levels.heartRateMetrics(sevenDaysAgo, tomorrow)
    const metabolicFitness = await levels.heartRateMetrics(sevenDaysAgo, tomorrow)

    const dump = JSON.stringify({
      rawGlucose,
      zones,
      streaks,
      heartRate,
      metabolicFitness
    })

    await promisify(fs.writeFile)(EXPORT_PATH, dump)
  } catch (error) {
    console.log("Error: ", error)
  }
}

