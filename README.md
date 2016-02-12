# hapi-mongo-swagger
This API accepts the json data from any service and use that data and converts it to JOSN and sends it to mongo and also 
to kafka using kafkasqueue plugin parallely. 

This also has hapi-swagger integration for dicumentation and testing purpose. 

With hapi-mongodb integration you can insert, delete and find the records from DB.

Using Apache nifi you can get the data from kafka and push it to Hadoop systems.
