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

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var myClient = new ls.LightstreamerClient("https://demo-apd.marketdatasystems.com");

var accountId = "";

var client_token = "";
var account_token = "";

myClient.connectionDetails.setUser(accountId);
myClient.connectionDetails.setPassword("CST-" + client_token + "|XST-" + account_token);

myClient.addListener({
  onStatusChange: function(newStatus) {         
    console.log(newStatus);
  }
});

myClient.connect();

var mySubscription = new ls.Subscription("MERGE",["MARKET:CS.D.USCGC.TODAY.IP"],["BID","OFFER","HIGH","LOW","MID_OPEN","CHANGE","CHANGE_PCT","MARKET_DELAY","MARKET_STATE","UPDATE_TIME"]);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("ig");

  mySubscription.addListener({
    onSubscription: function() {
      console.log("SUBSCRIBED");
    },
    onUnsubscription: function() {
      console.log("UNSUBSCRIBED");
      db.close();
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
  
  myClient.subscribe(mySubscription);  
});

