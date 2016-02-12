// create a kafkaesqe client, providing at least one broker
var kafkaesque = require('kafkaesque')({
  brokers: [{host: 'localhost', port: 9092}],
  clientId: 'MrFlibble',
  maxBytes: 2000000
});

// tearup the client
kafkaesque.tearUp(function() {
  // send two messages to the testing topic
  kafkaesque.produce({topic: 'inventories', partition: 0}, 
                     ['wotcher mush', 'orwlight geezer'], 
                     function(err, response) {
    // shutdown connection
    console.log(response);
    kafkaesque.tearDown();
  });
});