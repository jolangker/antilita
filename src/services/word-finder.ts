import puppeteer from "puppeteer"
import { storeWords } from "../misc/utils"
import fs from 'fs/promises'

export default class WordFinder {
  private createURL(phrase: string, page: string) {
    const url = new URL('http://kateglo.lostfocus.org/index.php')
    const query = {
      op: '4',
      type: 'r',
      mod: 'dictionary',
      p: page,
      srch: 'Cadr',
    }

    // @ts-ignore
    for (const key in query) url.searchParams.set(key, query[key])

    url.searchParams.set('phrase', phrase)

    return url
  }

  async getWordBanks () {
    return (await fs.readFile('./src/data/words.txt', 'utf-8')).split(',')
  }

  async findWords (input: string) {
    // search in cached first
    const cachedWords = await this.getWordBanks()
    const filteredWords = cachedWords.filter((word) => {
      return word.startsWith(input)
    })
    if (filteredWords.length) return filteredWords

    // start scrapping
    const browser = await puppeteer.launch({ headless: true, })
    const page = await browser.newPage()

    let currentPage = 1
    let lastPage = 1
    let words: string[] = []
    
    while (currentPage <= lastPage) {
      const url = this.createURL(input, currentPage.toString())
      
      await page.goto(url.href)

      const elements = await page.$$('dt');
      const textContents = await Promise.all(elements.map(element => page.evaluate(element => element.textContent, element))) as string[];
      words.push(...textContents)

      const pagination = await page.$('.pagination')
      if (pagination) {
        const paginationItems = await pagination.$$('li')
        
        if (paginationItems.length > 1) {
          const lastPagination = paginationItems[paginationItems!.length - 1]
          const anchor = await lastPagination.$('a')
          const href = await anchor!.getProperty('href')
          const hrefValue = await href!.jsonValue()
          const paginationUrl = new URLSearchParams(hrefValue)
          lastPage = parseInt(paginationUrl.get('p') as string)
        }
      }
      currentPage++
    }

    await browser.close()
    
    storeWords(words)

    return words
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
      return hardStartSyllables.some((syllable) => word.endsWith(syllable))
    })

    return hardest ?? this.getLongestWord(input)
  }

  async checkWordBanks () {
    const words = await this.getWordBanks()

    return {
      words,
      count: words.length
    }
  }
}