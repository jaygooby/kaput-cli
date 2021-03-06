/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-process-exit */
/* eslint-disable new-cap */
const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux')
const put = require('../../put-api')
const requireAuth = require('../../require-auth')
const chalk = require('chalk')

class ClearCommand extends Command {
  async run() {
    const {flags} = this.parse(ClearCommand)

    // Check for auth
    await requireAuth(flags.profile)

    // Clear transfers
    cli.action.start('Clearing transfers')
    await put.Transfers.ClearAll()
    .then(() => {
      cli.action.stop()
      this.log(chalk.green('Transfers cleared.'))
    })
    .catch(error => {
      this.log(chalk.red('Error:', error.data.error_message))
      process.exit(1)
    })
  }
}

ClearCommand.description = `Clear transfer list
...
This command clears all completed items from the tranfers list.
Note: No data will be removed.
`

ClearCommand.flags = {
  profile: flags.string({description: 'Name of the profile to use for authentication. Defaults to the "default" profile.'}),
}

module.exports = ClearCommand
