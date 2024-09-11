import puppeteer from "puppeteer";

const query: Record<string, string> = {
  op: '4',
  type: 'r',
  mod: 'dictionary',
  srch: 'Cadr',
}

export default () => {
  const url = new URL('http://kateglo.lostfocus.org/index.php')
  
  for (const key in query) url.searchParams.set(key, query[key])

  const getRelatedWords = async (input: string) => {
    url.searchParams.set('phrase', input)

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
  
    await page.goto(url.href)
    
    const elements = await page.$$('dt');
    const textContents = await Promise.all(elements.map(element => page.evaluate(element => element.textContent, element)));
    
    await browser.close()

    return textContents as string[]
  }

  const getSingleWord = async (input: string) => {
    const words = await getRelatedWords(input);
    
    return !words.length ? null : words.reduce((a, b) => a.length > b.length ? a: b)
  }

  const getFirstWord = async (input: string) => {
    const words = await getRelatedWords(input);
    
    return words[0] ?? null
  }

  const getRandomWord = async (input: string) => {
    const words = await getRelatedWords(input);
    if (!words.length) return null
    const idx = Math.floor(Math.random() * words.length)
    return words[idx]
  }


  return {
    getRelatedWords,
    getSingleWord,
    getFirstWord,
    getRandomWord
  }
}