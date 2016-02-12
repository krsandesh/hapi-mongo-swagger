/*
    Getting some 'http' power
*/
var http=require('http');

/*
    Setting where we are expecting the request to arrive.
    http://localhost:8125/upload

*/
var request = {
        hostname: 'localhost',
        port: 3000,
        path: '/myinventory',
        //method: 'GET'
};

/*
    Lets create a server to wait for request.
*/
http.createServer(function(request, response)
{
    /*
        Making sure we are waiting for a JSON.
    */
    response.writeHeader(200, {"Content-Type": "application/json"});

    /*
        request.on waiting for data to arrive.
    */
    request.on('data', function (chunk)
    {
        /* 
            CHUNK which we recive from the clients
            For out request we are assuming its going to be a JSON data.
            We print it here on the console. 
        */
        console.log("Json data that is sent as part of request is : "+chunk.toString('utf8'))

        /* 
            Using kafka-node - really nice library
            create a producer and connect to a Zookeeper to send the payloads.
        */
        var kafkaesque = require('kafkaesque')({
          brokers: [{host: 'localhost', port: 9092}],
          clientId: 'MrFlibble',
          maxBytes: 2000000
        });

            // tearup the client
            kafkaesque.tearUp(function() {
              // send two messages to the testing topic
              kafkaesque.produce({topic: 'inventories', partition: 0}, 
                                 [chunk], 
                                 function(err, response) {
                // shutdown connection
                console.log(response);
                kafkaesque.tearDown();
              });
            });

    });
    /*
        end of request
    */
    response.end();
/*
    Listen on port 3000
*/  
}).listen(3000);