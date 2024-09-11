import { useWordFinder } from "./services";
import { Client, Events, GatewayIntentBits  } from 'discord.js'

const wf = useWordFinder()

const client = new Client({
  intents: ['DirectMessages', 'DirectMessageReactions', 'GuildMessages', 'GuildMessageReactions', 'Guilds', 'MessageContent']
})

client.login(process.env.DISCORD_BOT)

client.on('messageCreate', async (msg) => {
  const channel = client.channels.cache.get(msg.channelId)
  if(!msg.cleanContent.startsWith('!at')) return
  const input = msg.cleanContent.split(' ')[1]
  const result = await wf.getRandomWord(input)
  channel?.send(result || 'gada jir')
})