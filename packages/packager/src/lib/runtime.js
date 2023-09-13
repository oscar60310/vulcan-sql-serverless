const { VulcanLambdaHandler } = require('@vulcan-sql-lambda/handler');
const { promises: fs } = require('fs');

let vulcanLambdaHandler;

async function handler(event, context) {
  if (!vulcanLambdaHandler) {
    const config = JSON.parse(await fs.readFile('config.json', 'utf-8'));
    vulcanLambdaHandler = new VulcanLambdaHandler(config);
    await vulcanLambdaHandler.init();
  }

  return vulcanLambdaHandler.handler(event, context);
}

exports.handler = handler;
