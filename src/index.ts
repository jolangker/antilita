import { WordFinder } from "./services";
import { Client  } from 'discord.js'
import { PREFIX_COMMAND } from "./misc/constants";
import clipboard from "clipboardy";
import { storeSyllables } from "./utils";

const wf = new WordFinder()

const client = new Client({
  intents: ['DirectMessages', 'DirectMessageReactions', 'GuildMessages', 'GuildMessageReactions', 'Guilds', 'MessageContent']
})

client.login(process.env.DISCORD_BOT)

client.on('messageCreate', async (msg) => {
  if(!msg.cleanContent.startsWith(PREFIX_COMMAND)) return
  const channel = client.channels.cache.get(msg.channelId)
  const command = msg.cleanContent.split('!')[1]

  let keyword

  if (command.includes('help')) {
    keyword = await getLatestKeyword(msg)
    if (!keyword) return channel?.send('lu blm mulai kocak')
  } else if (command.includes('find')) {
    keyword = msg.cleanContent.split(' ')[1]
  } else return
  
  if (!keyword) return channel?.send('lu blm masukin textnya kocak')
  const result = await wf.getHardestWord(keyword)

  channel?.send(result ?? 'gada jir')

  if (result) clipboard.writeSync(result)
  else storeSyllables(keyword)
})

const getLatestKeyword = async (message: any) => {
  let current = ''

  const channel = client.channels.cache.get(message.channelId)
  const messages = await channel?.messages.fetch({ limit: 100 })

  const alitaMessages = messages
    .filter((message: any) => message.author.username === 'Alita')
    .map((message: any) => message.embeds)

  alitaMessages.forEach((embeds: any) => {
    embeds.forEach((embed: any) => {
      embed.fields?.forEach((field: any) => {
        if (field.name === '-----') {
          const regex = /\`(.*?)\`/g;
          const matches = field.value.match(regex);
          current = matches.map((match: string) => match.replace(/`/g, ''))[0];
        }
      })
    })
  })

  return current
}