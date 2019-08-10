import { Server } from './server/server'

import { mainRouter } from './main.router';

import { tenantsRouter } from './resources/tenants/tenants.router';
import { usersRouter } from './resources/users/users.router';
import { divisionsRouter } from './resources/divisions/divisions.router';
import { demandsRouter } from './resources/demands/demands.router';
import { processesRouter } from './resources/processes/processes.router';
import { progressesRouter } from './resources/progresses/progresses.router';
import { automaticsRouter } from './resources/automatics/automatics.router';


// instanciar a classe Server
const server = new Server()

/* Invocar o método "bootstrap", que está na classe "Server"
   e que iniciará a aplicação. Este método receberá as instâncias
   das rotas à medida que elas forem sendo exportadas por suas
   respectivas classes, como ocorre com a classe UsersRouters. */
server.bootstrap([
    tenantsRouter,
    usersRouter,
    divisionsRouter,
    demandsRouter,
    processesRouter,
    progressesRouter,
    automaticsRouter,
    mainRouter
]).then(server => {
    console.log('Server is listening on:', server.application.address())
}).catch(error => {
    console.log('Server failed to start')
    console.error(error)
    process.exit(1) //codigo 1 indica uma saída anormal do programa
})



