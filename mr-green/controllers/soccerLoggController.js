var conf = require("../config/config");
var event = require("../models/Event").newDataset;

var prevGameArr = [];
function logSoccerEvents(response, times, version) {
      var msg = response.body;

      // if true outputs dividing line in logs
      var updated = false;
      // temporary current list
      var currentList = [];
      // total games in play
      var total = msg.length;

      // LOOP CURRENT -------------------------------------------------

      // loop all recieved games (main loop)
      for(var i in msg) {
          
        // current game (item)
        var item = {
          name: msg[i].name,
          open_date: msg[i].open_date,
          country: msg[i].country,
          market_count: msg[i].market_count
        }

        // is new flag def
        var isNew = true;
          
        // loop previous values in current loop
        for(var ii in prevGameArr) {
          
          // update
          if (prevGameArr[ii].name == item.name &&
            prevGameArr[ii].market_count != item.market_count) {
            
            event(
                date = Date(),
                eventType = "UPDATED",
                gameType = "SOCCER",
                gameId = prevGameArr[ii].id,
                gameName = prevGameArr[ii].name,
                country = prevGameArr[ii].country,
                openDate = prevGameArr[ii].open_date,
                marketCount = prevGameArr[ii].market_count,
                change = "Market Count changed FROM " + prevGameArr[ii].market_count + " TO " + item.market_count,
                comment = "",
                runnerVersion = version,
                runnerIteration = times
                ).save(function(err) {
                    if (err) {
                        console.log("ERROR writing UPDATED soccer game to DB");                        
                        throw err;
                    } 
                });

            updated = true;                
          }

          // check if new
          if (prevGameArr[ii].name == item.name) {
            isNew = false
          }

        // prev loop end
        }

        // output if new
        if (isNew) {

            event(
                date = Date(),
                eventType = "NEW",
                gameType = "SOCCER",
                gameId = item.id,
                gameName = item.name,
                coutry = item.country,
                openDate = item.open_date,
                marketCount = item.market_count,
                change = "New Game",
                comment = "",
                runnerVersion = version,
                runnerIterations = times
                ).save(function(err) {
                    if (err) {
                        console.log("ERROR writing NEW soccer game to DB");                        
                        throw err;
                    }
                });    

            updated = true;              
        }
          
        currentList.push(item);

      // main loop end
      }

      // is finished flag def
      var isFinished = true;

      // LOOP PREV ------------------------------------------------- 
      
      // prev loop
      for(var j in prevGameArr) {

        //set finished flag
        isFinished = true;

        // current loop in prev
        for(var jj in msg) {
           if (prevGameArr[j].name == msg[jj].name) {
             isFinished = false
           }
        }

        // output if finished
        if (isFinished) {
            event(
                date = Date(),
                eventType = "FINISHED",
                gameType = "SOCCER",
                gameId = prevGameArr[j].id,
                gameName = prevGameArr[j].name,
                country = prevGameArr[j].country,
                openDate = prevGameArr[j].open_date,
                marketCount = prevGameArr[j].market_count,
                change = "Finished Game",
                comment = "",
                runnerVersion = version,
                runnerIterations = times
                ).save(function(err) {
                    if (err) {
                        console.log("ERROR writing FINISHED soccer game to DB");                        
                        throw err;
                    }
                });    

          updated = true;              
        }
    
      // prev loop end
      }

      // current to previous
      prevGameArr = currentList;
      currentList = [];
    }

module.exports = { logSoccerEvents: logSoccerEvents }
