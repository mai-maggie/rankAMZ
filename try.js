const fetch = require("node-fetch");

async function getHtml() {
  const response = await fetch("https://www.baidu.com");
  const body = await response.text();
  console.log(body);
}

getHtml();
