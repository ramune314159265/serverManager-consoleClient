import { program } from 'commander'

program
	.option('-s, --serverOrigin <originURI>', '接続先', 'localhost:9000')
	.option('-i, --serverId <serverId>', 'サーバーID')

program.parse(process.argv)

const argOptions = program.opts()
const apiOrigin = argOptions.serverOrigin
const serverId = argOptions.serverId

console.log(`connecting to ${apiOrigin}, ${serverId} server`)
