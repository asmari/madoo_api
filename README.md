#BackEnd Swaps 

## install dependencies
npm install

## configuration
copy the `.env.sample` file to `.env` and put the configuration for DB and server port

- DB_HOST= host name/ip for database (default : 127.0.0.1)
- DB_DRIVER=dialect name for database (default : mysql)
- DB_NAME=database name want to use
- DB_USERNAME=username for database
- DB_PASSWORD=password for database
- SERVER_PORT=port for running server (default : 3000)

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

## run at localhost:3000
npm start