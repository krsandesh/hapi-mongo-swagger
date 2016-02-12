var Hapi = require('hapi');
var Joi = require('joi');

var server = new Hapi.Server();
server.connection({port:3000});

var todos = [
{
	todo: "take a nap",
	note: "note for nap"
},
{
	todo: "buy a book",
	note: "note for book"
},
{
	todo: "read a blog",
	note: "note for blog"
},
]

server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply){
		reply('Hello, World!');
	}
});

server.route({
	method: 'GET',
	path: '/test',
	handler: function(request, reply){
		reply('Hello, test world!');
	}
});

server.route({
	method: 'GET',
	path: '/{name}',
	handler: function(request, reply){
		reply('Hello,' +encodeURIComponent(request.params.name) + '!');
	}
});

server.route({
	method: 'GET',
	path: '/todos',
	handler: function(request,reply){
		reply(todos);
	}
});

server.route({
	method: 'GET',
	path: '/todo/{id}',
	handler: function(request,reply){

		if(request.params.id){
			console.log(todos.length);

			if(todos.length < request.params.id){
				return reply('No items found,').code(404);
			}
			return reply(todos[request.params.id - 1]);
		}
		reply(todos);
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
			todos.push(newTodo);
			reply(todos);
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
		if(todos.length < request.params.id){
			return reply('No Todo found.').code(404);
		}
		todos.splice((request.params.id - 1),1)
		reply(true);
	}
});

server.start(function(){
	console.log('Server running at:', server.info.uri);
});