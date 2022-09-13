const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Excel = require("exceljs");
const date = require("date-and-time");
const fetch = require("node-fetch");

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

//PURPOSE: read an elsx file, add date and keywords
async function workbookLoad() {
  let wb = new Excel.Workbook();
  wb = await wb.xlsx.readFile("target.xlsx");
  //NOTE: add keywords
  const keywordWorksheet = wb.getWorksheet("keywords");
  const sourceKeywordsColumn = keywordWorksheet.getColumn("A");
  const ws = wb.getWorksheet("data");
  let length = sourceKeywordsColumn.values.length;
  let emptyRowNum = emptyRowNumber(ws, 1); //WARNING:variable and function have to have different names!!!!
  const diff = emptyRowNum - 2;
  //NOTE: add date
  for (let i = emptyRowNum; i < length; i++) {
    ws.getRow(i).getCell(1).value = yesterday;
  }
  //NOTE: add keywords
  let j = 2;
  while (keywordWorksheet.getRow(j).getCell(1).value) {
    let keyword = keywordWorksheet.getRow(j).getCell(1).value;
    let asin = keywordWorksheet.getRow(j).getCell(2).value;
    ws.getRow(j + diff).getCell(2).value = keyword;
    ws.getRow(j + diff).getCell(3).value = asin;
    j++;
  }
  await wb.xlsx.writeFile("target.xlsx");
  console.log("workbook done");
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
  // const resourceLoader = new jsdom.ResourceLoader({
  //   proxy: "http://217.138.252.14",
  //   strictSSL: false,
  // });
  let options = {
    // resources: resourceLoader,
    resources: "usable",
  };
  let wb = new Excel.Workbook();
  wb = await wb.xlsx.readFile("target.xlsx");
  const ws = wb.getWorksheet("data");
  let document;
  let adAsinList = [];
  // const response = await fetch(searchKeyword(kw));
  // const body = await response.text();
  // const dom = new JSDOM(body);
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
    const targetSpan = document.querySelector(
      "span.a-size-base-plus.a-color-base.a-text-normal"
    );
    if (targetSpan === null) {
      ws.getRow(rowNumber).getCell(7).value = 0;
    } else {
      let targetSpanText = targetSpan.innerHTML;
      if (
        targetSpanText.includes("VocgoUU") === true ||
        targetSpanText.includes("HEH") === true
      ) {
        // console.log("SBV:true");
        ws.getRow(rowNumber).getCell(7).value = 1;
      } else {
        // console.log("SBV:false");
        ws.getRow(rowNumber).getCell(7).value = 0;
      }
    }

    wb.xlsx.writeFile("target.xlsx");
    //TODO: check if there's AC tag
  });
  // await wb.xlsx.writeFile(file);
}
//TODO: automate the function to find asin and keyword in the excel file and write result into it.
//PURPOSE: automate the function to find asin and keyword in the excel file and write result into it.
async function fillAutoExcel() {
  await workbookLoad();
  let wb = new Excel.Workbook();
  wb = await wb.xlsx.readFile("target.xlsx");
  ws = wb.getWorksheet("data");
  let emptyRowNum = emptyRowNumber(ws, 4);
  columnLength = ws.getColumn("A").values.length + emptyRowNum;
  for (let i = emptyRowNum; i < columnLength - 2; i++) {
    let keyword = ws.getRow(i).getCell(2).value;
    let asin = ws.getRow(i).getCell(3).value;
    await countRank(asin, keyword, "target.xlsx", i);
  }
}

// fillAutoExcel();
// workbookLoad();
countRank(process.argv[2], process.argv[3]);
