import fs from 'fs/promises'

export const storeSyllables = async (input: string) => {
  const currentSyllablesStr = await fs.readFile('./src/data/syllables.txt', 'utf-8')
  const syllables = currentSyllablesStr.split(',')

  if (!syllables.includes(input)) {
    syllables.push(input)

    await fs.writeFile('./src/data/syllables.txt', syllables.join(','))
  }
}

export const storeWords = async (input: string | string[]) => {
  const currentWordsStr = await fs.readFile('./src/data/words.txt', 'utf-8')

  const words = currentWordsStr.split(',')

  const strings = typeof input === 'string' ? [input] : input

  const newWords = [] as string[]

  strings.forEach((str) => {
    if (!words.includes(str)) newWords.push(str)
  })

  words.push(...newWords)

  await fs.writeFile('./src/data/words.txt', words.join(','))
}