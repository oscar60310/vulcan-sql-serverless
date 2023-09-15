# VulcanSql Serverless

Run [VulcanSQL](https://vulcansql.com) applications on top of [AWS Lambda](https://aws.amazon.com/lambda/).

### Quick start
1. Install extension.
  ```bash
  npm i -D @vulcan-sql-serverless/packager
  ```
2. Enable extension. Add the new line in your `vulcan.yaml` file.
  ```yaml
  extensions:
    serverless: "@vulcan-sql-serverless/packager"
  ```
3. Package you application. Your serverless code is ready in the `./dist` folder.
  ```bash
  vulcan package -o serverless
  ```

### Example Deployment

```bash
vulcan package -o serverless
cd ./dist
cp ../profiles.yaml . # Copy the profiles file, you may need other profile files for product env.
npm i
zip -r vulcan-serverless.zip ./* # Package the files to ZIP, you can upload this file to S3 and deploy it to Lambda functions.
```
