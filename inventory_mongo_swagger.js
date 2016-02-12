var Hapi = require('hapi');
var Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const HapiMongodb = require('hapi-mongodb');
const Inert = require('inert');
const Vision = require('vision');
const Pack = require('./package');

var dbOpts = {
	"url": "mongodb://127.0.0.1:27017/MyInventory",
	"settings": {
		"db": {
			"native_parser": false
		}
	}
};

var server = new Hapi.Server();
server.connection({
	//host:'localhost',
	port:3000,
	routes: {
        cors: {
        	origin : ['*'],
        	headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match','Accept-language']
        }
    }
});


server.register([
	Inert,
	Vision,
	{
	    register: HapiMongodb,	
	    options: dbOpts,    
	},{
		 register: HapiSwagger,
	    options: {
	        version: Pack.version,
	    }	
	}], function (err) {
	    if (err) {
	        console.error('Error while registering is: '+err);
	        throw err;       
	    }
	    else
	    startServer();
});

server.route({
	method: 'GET',
	path: '/myinventory',
	config: {
        // Include this API in swagger documentation
        tags: ['api'],
        description: 'Get All Inventory Json data',
        notes: 'This is Inventory data from Mongodb',
        handler: function(request, reply){
		var db = request.server.plugins['hapi-mongodb'].db;
		db.collection('inventories').find().toArray(function(err, doc){
			reply(doc);
		});
    	}	
	}
});

server.route({
	method: 'GET',
	path: '/myinventory/{id}',
	config: {
        // Include this API in swagger documentation
        tags: ['api'],
        description: 'Get All Inventory Json data',
        notes: 'This is Inventory data from Mongodb'
    },
	handler: function(request, reply){
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

		db.collection('inventories').findOne({"_id": new ObjectID(request.params.id)} ,
			function(err, result){ 
				if(err) 
					return reply(Hapi.error.internal('Internal Mongodb error', err));
			reply(result);
		});
	}
});

server.route({
	method: 'POST',
	path: '/myinventory',
	config:{
        // Include this API in swagger documentation
        tags: ['api'],
        description: 'Get All Inventory Json data',
        notes: 'This is Inventory data from Mongodb',
		handler: function(request, reply){
			var newInventory = {
				date: request.payload.date,
				LocationCode: request.payload.LocationCode,
				MaterialNumber: request.payload.MaterialNumber,
				InventoryOwnerID: request.payload.InventoryOwnerID,
				InventoryOwnerName: request.payload.InventoryOwnerName,
				AvailableQty: request.payload.AvailableQty,
				UnavailableQty: request.payload.UnavailableQty
			};

			var db = request.server.plugins['hapi-mongodb'].db;
			db.collection('inventories').insert(newInventory, {w:1}, function(err, doc){
				if(err){
					return reply(Hapi.error.internal('Internal Mongodb error', err));
				}
				else{
					reply(doc);
				}
			});


			/************Start************/
			/*-----------Below code is used to send data to Apache kafka----------------------------*/
	        var kafkaesque = require('kafkaesque')({
	          brokers: [{host: 'localhost', port: 9092}],
	          clientId: 'HPE',
	          maxBytes: 2000000
	        });

	            // tearup the client
	            kafkaesque.tearUp(function() {
	              // send two messages to the testing topic
	              kafkaesque.produce({topic: 'inventories', partition: 0}, 
	                                 [JSON.stringify(newInventory)], 
	                                 function(err, response) {
	                // shutdown connection
	                console.log(response);
	                kafkaesque.tearDown();
	              });
	            });
	   		 /************End************/
		},
		validate:{
			payload:{
				date: Joi.date().required(),
				LocationCode: Joi.string().required(),
				MaterialNumber: Joi.string().required(),
				InventoryOwnerID: Joi.string().required(),
				InventoryOwnerName: Joi.string().required(),
				AvailableQty: Joi.number().required(),
				UnavailableQty: Joi.number().required()
			}
		}
	}
});

server.route({
	method: 'DELETE',
	path: '/myinventory/{id}',
	handler: function(request, reply){
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

		db.collection('inventories').remove({
			"_id": new ObjectID(request.params.id)}, function(err){
			if(err){
				return reply(Hapi.error.internal('Internal Mongodb error', err));
			}
			reply("Record deleted");
		});
	}
});

function startServer(){
	server.start(function(err){
		//console.error('Server Start error is : '+err);
		console.log('Server running at:', server.info.uri);
	});
}