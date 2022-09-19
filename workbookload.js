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

// PURPOSE: read an elsx file, add date and keywords
async function workbookLoad() {
  let wb = new Excel.Workbook();
  wb = await wb.xlsx.readFile("target.xlsx");

  //NOTE: add date to input
  let input = new Excel.Workbook();
  input = await input.xlsx.readFile("input.xlsx");
  let inputWorksheet = input.getWorksheet("Sheet1");
  inputWorksheet.spliceColumns(1, 0, ["日期"]);
  const dateColumn = inputWorksheet.getColumn("A");
  dateColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 1) {
      cell.value = yesterday;
    }
  });
  await input.xlsx.writeFile("input.xlsx");

  //NOTE: copy input to worksheet
  let ystAd = wb.getWorksheet("广告明细");
  let emptyRowNumforInput = emptyRowNumber(ystAd, 1);
  const inputLength =
    inputWorksheet.getColumn("A").values.length + emptyRowNumforInput;

  const diffForInput = emptyRowNumforInput - 2;
  for (let i = emptyRowNumforInput; i < inputLength - 2; i++) {
    ystAd.getRow(i).values = inputWorksheet.getRow(i - diffForInput).values;
  }
  await wb.xlsx.writeFile("target.xlsx");

  //NOTE: add keywords
  const keywordWorksheet = wb.getWorksheet("keywords");
  const sourceKeywordsColumn = keywordWorksheet.getColumn("A");
  const ws = wb.getWorksheet("data");
  let emptyRowNum = emptyRowNumber(ws, 1); //WARNING:variable and function have to have different names!!!!
  let length = sourceKeywordsColumn.values.length + emptyRowNum;
  const diff = emptyRowNum - 2;
  //NOTE: add date
  for (let i = emptyRowNum; i < length - 2; i++) {
    ws.getRow(i).getCell(1).value = yesterday;
  }
  //NOTE: copy keywords
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

workbookLoad();
