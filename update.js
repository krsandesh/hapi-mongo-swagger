var Hapi = require('hapi');
var Joi = require('joi');

var dbOpts = {
    "url": "mongodb://127.0.0.1:27017/mytodos",
    "settings": {
        "db":{
                "native_parser": false
            }   
        }
};

var server = new Hapi.Server();
server.connection({port:3001});


server.register({
    register: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    startServer();
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply){
                var db = request.server.plugins['hapi-mongodb'].db;
                db.collection('todos').find().toArray(function(err, doc){
                reply(doc);
        });
    }
});

function startServer()
{
    server.start(function(err){
        console.log('Server running at:', server.info);
    });
}




