# Lightstreamer - Basic IG Demo - Node.js Client

## Clone the repo
```bash
git clone https://github.com/weevilcorp/Lightstreamer-example-StockList-client-node.git
```
## Enter the directory and install node modules
```bash
cd Lightstreamer-example-StockList-client-node.git
npm i
```
## Create the .env file
```bash
cat <<EOT >> .env
cst: "<CST>"
token: "<TOKEN>"
accountId: "<ACCOUNTID>"
EOT
```
You can get the cst and token using [ig-markets].
## Run the streamer
```bash
node src/index.js
```

[ig-markets]: https://github.com/weevilcorp/ig-markets
