const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//SESSION: deal with search keyword to url
function searchKeyword(keyword) {
  let keywordUrl = `https://www.amazon.com/s?k=`;
  let keywordArray = keyword.split(" ");
  for (let i = 0; i < keywordArray.length; i++) {
    if (i < keywordArray.length - 1) {
      keywordUrl = `${keywordUrl}
    ${keywordArray[i]}+`;
    } else {
      keywordUrl = `${keywordUrl}
    ${keywordArray[i]}`;
    }
  }
  keywordUrl = `${keywordUrl}&ref=cs_503_search`;
  return keywordUrl;
}

//SESSION: find indexof ASIN
async function findAdIndexofASIN(targetAsin, keyword) {
  let document;
  let adAsinList = [];
  JSDOM.fromURL(searchKeyword(keyword)).then((dom) => {
    dom.serialize();
    document = dom.window.document;
    //SUB: Ad rank
    const AdHolders = document.querySelectorAll(".s-asin.AdHolder");
    AdHolders.forEach((adHolder) => {
      adAsinList.push(adHolder.dataset.asin.toString());
    });
    console.log(`Ad Rank:${adAsinList.indexOf(targetAsin) + 1}`);

    //SUB: Organic rank
    let organicAsinList = [];
    const organicHolders = document.querySelectorAll(
      "div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16:not(.AdHolder)"
    );
    organicHolders.forEach((organicHolder) => {
      organicAsinList.push(organicHolder.dataset.asin.toString());
    });
    console.log(`Organic Rank:${organicAsinList.indexOf(targetAsin) + 1}`);
  });
}

findAdIndexofASIN(process.argv[2], process.argv[3]);
