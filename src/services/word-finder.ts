import puppeteer from "puppeteer"
import { storeWords } from "../utils"
import fs from 'fs/promises'

export default class WordFinder {
  private createURL(phrase: string) {
    const url = new URL('http://kateglo.lostfocus.org/index.php')
    const query = {
      op: '4',
      type: 'r',
      mod: 'dictionary',
      srch: 'Cadr',
    }

    // @ts-ignore
    for (const key in query) url.searchParams.set(key, query[key])

    url.searchParams.set('phrase', phrase)

    return url
  }

  async findWords (input: string) {
    // search in cached first
    const cachedWords = (await fs.readFile('./src/data/words.txt', 'utf-8')).split(',')
    const filteredWords = cachedWords.filter((word) => {
      return word.startsWith(input)
    })
    if (filteredWords.length) return filteredWords

    // start scrapping
    const url = this.createURL(input)

    const browser = await puppeteer.launch({ headless: true, })
    const page = await browser.newPage()
  
    await page.goto(url.href)
    
    const elements = await page.$$('dt');
    const textContents = await Promise.all(elements.map(element => page.evaluate(element => element.textContent, element))) as string[];
    await browser.close()

    storeWords(textContents)

    return textContents
  }

  async getLongestWord(input: string) {
    const words = await this.findWords(input)
    if (!words.length) return null

    const maxLength = Math.max(...words.map((word) => word.length))
    
    return words.find((word) => word.length === maxLength) as string
  }

  async getHardestWord (input: string) {
    const syllables = require ('../data/syllables.txt')

    const words = await this.findWords(input);
    if (!words.length) return null;

    const hardStartSyllables = syllables.default.split(',') as string[]

    const hardest = words.find((word) => {
      console.log(word, hardStartSyllables.some((syllable) => word.endsWith(syllable)))
      return hardStartSyllables.some((syllable) => word.endsWith(syllable))
    })

    return hardest ?? this.getLongestWord(input)
  }
}