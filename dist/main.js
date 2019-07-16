"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server/server");
const users_router_1 = require("./resources/users/users.router");
const divisions_router_1 = require("./resources/divisions/divisions.router");
const main_router_1 = require("./main.router");
const requests_router_1 = require("./resources/requests/requests.router");
const tenants_router_1 = require("./resources/tenants/tenants.router");
// instanciar a classe Server
const server = new server_1.Server();
/* Invocar o método "bootstrap", que está na classe "Server"
   e que iniciará a aplicação. Este método receberá as instâncias
   das rotas à medida que elas forem sendo exportadas por suas
   respectivas classes, como ocorre com a classe UsersRouters. */
server.bootstrap([
    tenants_router_1.tenantsRouter,
    users_router_1.usersRouter,
    divisions_router_1.divisionsRouter,
    requests_router_1.requestsRouter,
    main_router_1.mainRouter
]).then(server => {
    console.log('Server is listening on:', server.application.address());
}).catch(error => {
    console.log('Server failed to start');
    console.error(error);
    process.exit(1); //codigo 1 indica uma saída anormal do programa
});
