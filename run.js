const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

//PURPOSE: deal with search keyword to url
//INPUT: keyword to search
//OUTPUT: keyword url
function searchKeyword(keyword) {
  let keywordUrl = `https://www.amazon.com/s?k=`;
  let keywordArray = keyword.split(" ");
  for (let i = 0; i < keywordArray.length; i++) {
    if (i < keywordArray.length - 1) {
      keywordUrl = `${keywordUrl}${keywordArray[i]}+`;
    } else {
      keywordUrl = `${keywordUrl}${keywordArray[i]}`;
    }
  }
  keywordUrl = `${keywordUrl}&ref=cs_503_search`;
  return keywordUrl;
}

//PURPOSE: find index of ASIN and brand name
//INPUT: Asin to search keyword to search
//OUTPUT: ASIN ranks and if it has SB
async function findAdIndexofASIN(targetAsin, keyword) {
  let document;
  let adAsinList = [];
  JSDOM.fromURL(searchKeyword(keyword), { resources: "usable" }).then((dom) => {
    // dom.serialize();
    document = dom.window.document;
    //NOTE: Ad rank
    const AdHolders = document.querySelectorAll(".s-asin.AdHolder");
    AdHolders.forEach((adHolder) => {
      adAsinList.push(adHolder.dataset.asin.toString());
    });

    //NOTE: Organic rank
    let organicAsinList = [];
    const organicHolders = document.querySelectorAll(
      "div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16:not(.AdHolder)"
    );
    organicHolders.forEach((organicHolder) => {
      organicAsinList.push(organicHolder.dataset.asin.toString());
    });
    //NOTE: print rank
    console.log(keyword);
    console.log(`Organic Rank:${organicAsinList.indexOf(targetAsin) + 1}`);
    console.log(`Ad Rank:${adAsinList.indexOf(targetAsin) + 1}`);
    //NOTE: check SB's asin
    let findSBAsin = false;
    const sbAsins = document.querySelectorAll(
      ".a-section.a-spacing-none._bGlmZ_container_3q4Jr._bGlmZ_block_1vI8-._bGlmZ_hFull_2lnNw._bGlmZ_wFull_3f8b2._bGlmZ_col_358pf"
    );
    sbAsins.forEach((sbAsin) => {
      if (sbAsin.dataset.asin === targetAsin) {
        findSBAsin = true;
      }
    });
    //NOTE: print true or false
    console.log(`SB: ${findSBAsin}`);

    //NOTE: copy document to make a new html file
    // console.log(dom);
    const targetSpan = document.querySelector(
      "span.a-size-base-plus.a-color-base.a-text-normal"
    ).innerHTML;
    if (
      targetSpan.includes("VocgoUU") === true ||
      targetSpan.includes("HEH") === true
    ) {
      console.log("SBV:true");
    } else {
      console.log("SBV:false");
    }
    //TODO: check if there's AC tag
    //TODO: automate the function to find asin and keyword in the excel file and write result into it.
  });
}

findAdIndexofASIN(process.argv[2], process.argv[3]);
