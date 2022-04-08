/*
Copyright (c) Lightstreamer Srl

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var ls = require('lightstreamer-client-node');

const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

var accountId = "";

async function run() {
  await client.connect();
  const dbo = client.db("ig");

  var mysort = { date: -1 };
  dbo.collection("tokens").find().sort(mysort).limit(1).toArray(async function(err, result) {
      if (err) throw err;

      var myClient = new ls.LightstreamerClient("https://demo-apd.marketdatasystems.com");

      myClient.connectionDetails.setUser(accountId);
      myClient.connectionDetails.setPassword("CST-" + result[0].cst + "|XST-" + result[0].token);
      
      myClient.addListener({
        onStatusChange: function(newStatus) {         
          console.log(newStatus);
        }
      });
      
      myClient.connect();

      var myAccountSubscription = new ls.Subscription("MERGE",["ACCOUNT:"+accountId],["PNL","DEPOSIT","AVAILABLE_CASH","PNL_LR","PNL_NLR","FUNDS","MARGIN","MARGIN_LR","MARGIN_NLR","AVAILABLE_TO_DEAL","EQUITY","EQUITY_USED"]);
      
      myAccountSubscription.addListener({
          onSubscription: function() {
            console.log("SUBSCRIBED");
          },
          onUnsubscription: function() {
            console.log("UNSUBSCRIBED");
          },
          onItemUpdate: function(obj) {
            console.log(obj.getValue("PNL") + " : " + obj.getValue("DEPOSIT") + " : " + obj.getValue("AVAILABLE_CASH") + " : " + obj.getValue("FUNDS") + " : " + obj.getValue("MARGIN"));
        
            const query = { ACCOUNT: accountId };
            const update = { $set: { 
              ACCOUNT: accountId, PNL: obj.getValue("PNL"),
              PNL: obj.getValue("PNL"),
              DEPOSIT: obj.getValue("DEPOSIT"),
              AVAILABLE_CASH: obj.getValue("AVAILABLE_CASH"),
              PNL_LR: obj.getValue("PNL_LR"),
              PNL_NLR: obj.getValue("PNL_NLR"),
              FUNDS: obj.getValue("FUNDS"),
              MARGIN: obj.getValue("MARGIN"),
              MARGIN_LR: obj.getValue("MARGIN_LR"),
              MARGIN_NLR: obj.getValue("MARGIN_NLR"),
              AVAILABLE_TO_DEAL: obj.getValue("AVAILABLE_TO_DEAL"),
              EQUITY: obj.getValue("EQUITY"),
              EQUITY_USED: obj.getValue("EQUITY_USED"),
              RECEIVED_DATE: Date.now() 
            }};
            const options = { upsert: true };
    
            dbo.collection("ACCOUNT").updateOne(query, update, options,  function(err, res) {
              if (err) throw err;
            });  
          }
      });
    
      myClient.subscribe(myAccountSubscription);
      
      var myMarketSubscription = new ls.Subscription("MERGE",["MARKET:CS.D.USCGC.TODAY.IP"],["BID","OFFER","HIGH","LOW","MID_OPEN","CHANGE","CHANGE_PCT","MARKET_DELAY","MARKET_STATE","UPDATE_TIME"]);
      
      myMarketSubscription.addListener({
          onSubscription: function() {
            console.log("SUBSCRIBED");
          },
          onUnsubscription: function() {
            console.log("UNSUBSCRIBED");
          },
          onItemUpdate: function(obj) {
            console.log(obj.getValue("BID") + " : " + obj.getValue("OFFER"));
        
            var myobj = { 
              BID: obj.getValue("BID"),
              OFFER: obj.getValue("OFFER"),
              HIGH: obj.getValue("HIGH"),
              LOW: obj.getValue("LOW"),
              MID_OPEN: obj.getValue("MID_OPEN"),
              CHANGE: obj.getValue("CHANGE"),
              CHANGE_PCT: obj.getValue("CHANGE_PCT"),
              MARKET_DELAY: obj.getValue("MARKET_DELAY"),
              MARKET_STATE: obj.getValue("MARKET_STATE"),
              UPDATE_TIME: obj.getValue("UPDATE_TIME"),
              RECEIVED_DATE: Date.now() 
            };
    
            dbo.collection("gold").insertOne(myobj, function(err, res) {
              if (err) throw err;
            });  
          }
      });
    
      myClient.subscribe(myMarketSubscription);
  });
}

run().catch(console.dir);
