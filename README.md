#BackEnd Swaps 

## Install dependencies
npm install

## Configuration
copy the `.env.sample` file to `.env` and put the configuration for DB and server port

- DB_HOST= host name/ip for database (default : 127.0.0.1)
- DB_DRIVER=dialect name for database (default : mysql)
- DB_NAME=database name want to use
- DB_USERNAME=username for database
- DB_PASSWORD=password for database
- SERVER_PORT=port for running server (default : 3000)
- CMS_URL = Email verification configuration need to put [token] inside (example = http://somesite.com/email/[token]/verify or http://somesite.com/email/verify?token=[token]) 

## Security
Security for api is using JWT. To add security for each route, you can add `fastify.authenticate` with `beforeHandler` options. Example : 

```Javascript

    //Example Routing to index
    /* if jwt not included on header, the route will redirect to 401 not authorized, else will print Hello World! */

    fastify.get("/", {
        beforeHandler:fastify.authenticate
    },(request, reply) => {
        reply.send("Hello World!")
    })

```
## Eslint
This project support using ESLint with `airbnb-base` and `babel-eslint`. Install eslint module on your favorite IDE, restart it and the Eslint will be detected automatically. [AirBnb Style Guide](https://github.com/airbnb/javascript)


## Run at localhost:3000
npm start

------

## Auth Key Header
Swapz Backend api need client_id with client_secret to access the api to prevent hot link access the api. Use the command utility to create or list auth keys.

### Command Utility
##### Create auth key
```console
node command create --name=name_your_auth

Config: 
-n, --name : Name for the auth
```

##### List auth keys
```console
node command list
```
