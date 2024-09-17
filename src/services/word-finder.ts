import puppeteer from "puppeteer"

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

  cachedWords: string[] = []

  async findWords (input: string) {
    // search in cached first
    // const words = this.cachedWords.filter((word) => {
    //   return word.startsWith(input)
    // })

    // if (words.length) return words

    // start scrapping
    const url = this.createURL(input)

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
  
    await page.goto(url.href)
    
    const elements = await page.$$('dt');
    const textContents = await Promise.all(elements.map(element => page.evaluate(element => element.textContent, element))) as string[];
    
    await browser.close()

    this.cachedWords = [...this.cachedWords, ...textContents]

    return textContents
  }

  async getLongestWord(input: string) {
    const words = await this.findWords(input)
    
    return !words.length ? null : words.reduce((a, b) => a.length > b.length ? a: b)
  }

  async getHardestWord (input: string) {
    const syllables = require ('../data/syllables.txt')

    const words = await this.findWords(input);
    if (!words.length) return null;

    const hardStartSyllables = syllables.default.split(',') as string[]

    const hardest = words.find((word) => hardStartSyllables.some((syllable) => word.endsWith(syllable)))

    return hardest ?? this.getLongestWord(input)
  }
}