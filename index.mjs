import { program } from 'commander'
import WebSocket from 'websocket'

program
	.option('-s, --serverOrigin <originURI>', '接続先', 'localhost:9000')
	.option('-i, --serverId <serverId>', 'サーバーID')

program.parse(process.argv)

const argOptions = program.opts()
const apiOrigin = argOptions.serverOrigin
const serverId = argOptions.serverId
console.log(`connecting to ${apiOrigin}, ${serverId} server`)

const consoleHistory = (await (await fetch(`http://${apiOrigin}/api/v1/servers/${serverId}/console/history`)).json()).content
if (consoleHistory === 'not found') {
	throw new Error('not found')
}
process.stdout.write(consoleHistory)
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding('utf8')

const wsClient = new WebSocket.client()

wsClient.on('connect', connection => {
	connection.on('close', ch => {
		console.log(`connection closed ${ch}`)
	})
	connection.on('message', message => {
		if (message.type !== 'utf8') {
			return
		}
		const data = JSON.parse(message.utf8Data)
		process.stdout.write(data.content)
	})
	process.stdin.on('data', key => {
		if (key === '\u0003') {
			process.exit()
		}
		connection.send(JSON.stringify({
			type: 'write_stdin',
			content: key.toString()
		}))
	})
})

wsClient.connect(`ws://${apiOrigin}/api/v1/servers/${serverId}/console/ws/`)
