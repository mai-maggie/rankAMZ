const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Excel = require("exceljs");
const date = require("date-and-time");

//NOTE: get date
var now = new Date();
now = date.addDays(now, -1);
var yesterday = date.format(now, "YYYY/MM/DD");

//PURPOSE: find the first empty row in target worksheet
//INPUT: worksheet
//OUTPUT: find the number of the first empty row
function emptyRowNumber(worksheet, columnNum) {
  let emptyRowNumber;
  let i = 1;
  while (i > 0) {
    if (
      worksheet.getRow(i).values[columnNum] === undefined ||
      worksheet.getRow(i).values[columnNum] === null
    ) {
      emptyRowNumber = i;
      break;
    } else {
      i++;
    }
  }
  return emptyRowNumber;
}

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
//INPUT: Asin,keyword,file,rownumber
//OUTPUT: ASIN ranks and if it has SB,SBV
async function countRank(targetAsin, kw) {
  let options = {
    resources: "usable",
  };
  let wb = new Excel.Workbook();
  wb = await wb.xlsx.readFile("target.xlsx");
  const ws = wb.getWorksheet("data");
  let document;
  let adAsinList = [];
  JSDOM.fromURL(searchKeyword(kw), options).then((dom) => {
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
    let rowNumber = emptyRowNumber(ws, 4);
    ws.getRow(rowNumber).getCell(4).value =
      organicAsinList.indexOf(targetAsin) + 1;

    // console.log(`Organic Rank:${organicAsinList.indexOf(targetAsin) + 1}`);

    // console.log(`Ad Rank:${adAsinList.indexOf(targetAsin) + 1}`);
    ws.getRow(rowNumber).getCell(5).value = adAsinList.indexOf(targetAsin) + 1;

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
    //NOTE: print true=1 or false=0
    if (findSBAsin === true) {
      ws.getRow(rowNumber).getCell(6).value = 1;
    } else {
      ws.getRow(rowNumber).getCell(6).value = 0;
    }
    // console.log(`SB: ${findSBAsin}`);

    // //NOTE: SBV
    let targetSpanArray = [];
    const targetSpans = document.querySelectorAll(
      "span.a-size-medium.a-color-base.a-text-normal"
    );
    if (targetSpans !== null || targetSpans !== undefined) {
      targetSpans.forEach((targetSpan) => {
        if (
          targetSpan.innerHTML.includes("VocgoUU") === true ||
          targetSpan.innerHTML.includes("HEH") === true
        ) {
          targetSpanArray.push(1);
        }
      });
      if (targetSpanArray.length > 0) {
        ws.getRow(rowNumber).getCell(7).value = 1;
      } else {
        ws.getRow(rowNumber).getCell(7).value = 0;
      }
    } else {
      ws.getRow(rowNumber).getCell(7).value = 0;
    }

    //TODO: check if there's AC tag
    //NOTE: AC tag
    const acTag = document.querySelector(`#${targetAsin}-amazons-choice`);
    if (acTag === null || acTag === undefined) {
      ws.getRow(rowNumber).getCell(8).value = 0;
    } else {
      ws.getRow(rowNumber).getCell(8).value = 1;
    }
    wb.xlsx.writeFile("target.xlsx");
  });
}
//NOTE: have to execute one by one

// await countRank("B09MDHMPZD", "2x4 led drop ceiling light fixture");
// await countRank("B09MDHMPZD", "2x4 led light fixture");
// await countRank("B09MDHMPZD", "2x4 led flat panel light 5000k");
// await countRank("B09MDHMPZD", "led panel lights 2x4");
// await countRank("B09MDHMPZD", "2x4 led troffer");
// await countRank("B09MDHMPZD", "2x4 led flat panel light");
// await countRank("B09MDHMPZD", "led flat panel light 2x4");
// await countRank("B09MDHMPZD", "led 2x4 flat panel light");
// await countRank("B09MDHMPZD", "2x4 led panel");
// await countRank("B09MDHMPZD", "led drop ceiling lights 2x4");
// await countRank("B09MDHMPZD", "troffer light 2x4");
// await countRank("B09MDHMPZD", "led 2x4 drop ceiling lights");
// await countRank("B09MDHMPZD", "2x4 light fixture");
// await countRank("B09MDHMPZD", "2x4 led");
// await countRank("B09MDHMPZD", "2'x4' led flat light panel");

// countRank("B09MDGNFJV", "2x2 led flat panel light");
// countRank("B09MDGNFJV", "2x2 led light drop ceiling");
// countRank("B09MDGNFJV", "2x2 led flat panel light 4000k");
// countRank("B09MDGNFJV", "2x2 led flat panel light 5000k");
// countRank("B09MDGNFJV", "led drop ceiling lights 2x2");
// countRank("B09MDGNFJV", "2x2 led panel");
// countRank("B09MDGNFJV", "2x2 led light");
// countRank("B09MDGNFJV", "2x2 lay in led light fixtures");
// countRank("B09MDGNFJV", "2x2 led");

// countRank("B07HH46NHF", "2x4 surface mount kit");
// countRank("B07HH46NHF", "surface mount kit 2x4");
// countRank("B07HH46NHF", "2x4 led surface mount kit");
// countRank("B07HH46NHF", "2x4 flat panel mount kit");

// countRank("B08DRKT5N5", "2x2 surface mount kit");
// countRank("B08DRKT5N5", "2x2 led panels surface mount kit");
// countRank("B08DRKT5N5", "led 2x2 surface mount frames");

// countRank("B08CHB5B7L", "1x4 surface mount kit");
// countRank("B08CHB5B7L", "1x4 led flat panel mount kit");
// countRank("B08CHB5B7L", "10 pack 1x4 ft led surface mount kit");

countRank(process.argv[2], process.argv[3]);
