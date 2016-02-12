var kafka = require('kafka-node'),
        Producer = kafka.Producer,
        //client = new kafka.Client('kafka:2181'),
        client = new kafka.Client('localhost:9092'),
        producer = new Producer(client);

         payloads = [
            { 
                topic: 'inventories', 
                messages: 'Message message', 
                partition: 0 
            },
        ];

        /*
            producer 'on' ready to send payload to kafka.
        */
       console.log('Before producer on method');
        producer.on('ready', function(err){
            if(err){
                console.log('Error is :'+err)
                console.error('Error is :'+err)
            }
            producer.send(payloads, function(err, data){
                    console.log("Data sent is : "+data)
            });
        });