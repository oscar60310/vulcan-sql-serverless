const { VulcanServerlessHandler } = require('@vulcan-sql-serverless/handler');
const { promises: fs } = require('fs');

let vulcanServerlessHandler;

async function handler(event, context) {
  if (!vulcanServerlessHandler) {
    const config = JSON.parse(await fs.readFile('config.json', 'utf-8'));
    vulcanServerlessHandler = new VulcanServerlessHandler(config);
    await vulcanServerlessHandler.init();
  }

  return vulcanServerlessHandler.handler(event, context);
}

exports.handler = handler;
