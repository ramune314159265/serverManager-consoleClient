import { program } from 'commander'
import WebSocket from 'websocket'
import { question } from "readline-sync"

program
	.option('-s, --hostname <hostname>', '接続先')
	.option('-i, --serverId <serverId>', 'サーバーID')
	.parse(process.argv)

const argOptions = program.opts()
const apiHostname = argOptions.hostname ?? question('API hostname :')
const serverId = argOptions.serverId ?? question('serverID :')
console.log(`connecting to ${apiHostname}, ${serverId} server`)

const consoleHistory = (await (await fetch(`http://${apiHostname}/api/v1/servers/${serverId}/console/history`)).json()).content
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
		process.stdout.write('\n')
		console.log(`connection closed ${ch}`)
		process.exit()
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

wsClient.connect(`ws://${apiHostname}/api/v1/servers/${serverId}/console/ws/`)
