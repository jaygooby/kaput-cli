/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-process-exit */
/* eslint-disable new-cap */
/* eslint-disable no-await-in-loop */
const {Command, flags} = require('@oclif/command')
const RarbgApi = require('rarbg')
const {cli} = require('cli-ux')
const put = require('../put-api')
const chalk = require('chalk')
const inquirer = require('inquirer')

const rarbg = new RarbgApi()

class RarbgCommand extends Command {
  async run() {
    const {flags} = this.parse(RarbgCommand)
    let query = flags.query || null
    const folderID = flags.folderID || 0

    // Check for auth
    cli.action.start('Checking authentication')
    await put.User.Info()
    .catch(() => {
      this.log(chalk.red('Error: You must first login to the CLI using the "login" command.'))
      process.exit(1)
    })
    .finally(() => {
      cli.action.stop()
    })

    // Confirm search query
    while (!query) {
      query = await cli.prompt(chalk.bold('Search RARBG'))
    }

    // Search RARBG
    let searchResults = []
    cli.action.start('Searching RARBG')
    await rarbg.search({
      // eslint-disable-next-line camelcase
      search_string: query,
      sort: 'seeders',
    })
    .then(r => {
      r.forEach(element => {
        searchResults.push({name: element.filename, value: element.download})
      })
    })
    .catch(error => {
      this.log(chalk.red('Error:', error + ' Perhaps search again in a few seconds. The RARBG API can be finicky.'))
      process.exit(1)
    })
    .finally(() => {
      cli.action.stop()
    })

    // Prompt for selection
    let selectedTorrents = null
    await inquirer
    .prompt([{
      name: 'torrent',
      message: 'What should be sent to Put?',
      type: 'checkbox',
      choices: searchResults,
    }])
    .then(answers => {
      selectedTorrents = answers.torrent
    })
    .catch(error => {
      this.log(chalk.red('Error:', error))
      process.exit(1)
    })

    // Send to put
    cli.action.start('Sending to Put')
    for (const magnet of selectedTorrents) {
      await put.Transfers.Add({url: magnet, saveTo: folderID})
      .then(r => {
        this.log('Added:', r.data.transfer.name)
      })
      .catch(error => {
        this.log(chalk.red('Error:', error.data.error_message))
        process.exit(1)
      })
    }
    cli.action.stop()
    this.log(chalk.green('All files sent to Put.'))
  }
}

RarbgCommand.description = `Search and add torrents from RARBG
...
Searches RARBG for matching content.
Once a torrent is selected, it is sent to Put.io as a transfer.
Note: The RARBG API can be finicky. If a search returns no results you can try again, or try slightly altering your search.
`

RarbgCommand.flags = {
  query: flags.string({char: 'q', description: 'Name of content to search for.'}),
  folderID: flags.string({char: 'f', description: 'ID of the folder it should download to (on Put.io). Defaults to the root folder.'}),
}

module.exports = RarbgCommand