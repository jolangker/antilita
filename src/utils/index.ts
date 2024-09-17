import fs from 'fs'

export const storeSyllables = (input: string) => {
  const currentSyllablesStr = require('../data/syllables.txt').default as string

  const syllables = currentSyllablesStr.split(',')

  if (!syllables.includes(input)) {
    syllables.push(input)

    fs.writeFileSync('./src/data/syllables.txt', syllables.join(','))
  }
}