var Hapi = require('hapi');
var Joi = require('joi');

var dbOpts = {
	"url": "mongodb://127.0.0.1:27017/mytodos",
	"settings": {
		"db": {
			"native_parser": false
		}
	}
};

var server = new Hapi.Server();
server.connection({port:3000});


server.register({
    register: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    /*if (err) {
        console.error('Error while registering is: '+err);
        throw err;       
    }*/
    console.error('Register error is : '+err);
    startServer();
});



server.route({
	method: 'GET',
	path: '/todos',
	handler: function(request, reply){
		var db = request.server.plugins['hapi-mongodb'].db;
		db.collection('todos').find().toArray(function(err, doc){
			reply(doc);
		});
		
	}
});

server.route({
	method: 'GET',
	path: '/todo/{id}',
	handler: function(request, reply){
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

		db.collection('todos').findOne({"_id": new ObjectID(request.params.id)} ,
			function(err, result){ 
				if(err) 
					return reply(Hapi.error.internal('Internal Mongodb error', err));
			reply(result);
		});
	}
});

server.route({
	method: 'POST',
	path: '/todos',
	config:{
		handler: function(request, reply){
			var newTodo = {
				todo: request.payload.todo,
				note: request.payload.note
			};

			var db = request.server.plugins['hapi-mongodb'].db;
			db.collection('todos').insert(newTodo, {w:1}, function(err, doc){
				if(err){
					return reply(Hapi.error.internal('Internal Mongodb error', err));
				}
				else{
					reply(doc);
				}
			});
		},
		validate:{
			payload:{
				todo: Joi.string().required(),
				note: Joi.string().required()
			}
		}
	}
});

server.route({
	method: 'DELETE',
	path: '/todo/{id}',
	handler: function(request, reply){
		var db = request.server.plugins['hapi-mongodb'].db;
		var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

		db.collection('todos').remove({
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
		console.error('Server Start error is : '+err);
		console.log('Server running at:', server.info.uri);
	});
}