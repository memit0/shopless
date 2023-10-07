const axios = require('axios')
const cheerio = require('cheerio')
const Tesseract = require('tesseract.js')

async function getFootprintNum (item) {
  const formattedItem = item.replace(/ /g, '%20')
  const url = `https://apps.carboncloud.com/climatehub/search?q=${formattedItem}&market=USA&gate=StoreShelf`

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(response => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          const results = $('._346728af').first()
          const item = results.find('._27d1ed53').text()
          let footprint = results.find('._b12a1141').text()
          const parts = footprint.split(' ')
          footprint = parseFloat(parts[0])
          resolve(footprint)
        } else {
          console.error('Failed to fetch the web page')
          resolve(0)
        }
      })
      .catch(error => {
        console.error('Error:', error)
        resolve(0)
      })
  })
}

async function getTotalFootprint (arrItems) {
  let total = 0
  for (let i = 0; i < arrItems.length; i++) {
    const val = await getFootprintNum(arrItems[i])
    total += val
  }
  return total
}

async function receiptToArr(file) {
  // Load an image
  const image = file;

  try {
    const { data: { text } } = await Tesseract.recognize(image, 'eng');
    
    // `text` contains the extracted text
    const textWithoutNumbersAndDollars = text.replace(/[\d$@.]+/g, '');

    // Store the OCR output in a variable
    const ocrResult = textWithoutNumbersAndDollars;
    const list = ocrResult.split('\n');

    return list;
  } catch (error) {
    console.error('Error during OCR:', error);
    return [];
  }
}
 
// async function receiptToFootprint(file){

// }

async function main () {
  // items = ['DATE // wen','FERRER ER','UCHINNT GREEN ']
  // const search = await getTotalFootprint(items)
  let arr = await receiptToArr ('./receipt.jpg')
  arr = arr.slice(0,6)
  const search = await getTotalFootprint(arr)
  console.log(search)

}

main()
