import { Server } from './server/server'
import { usersRouter } from './resources/users/users.router';
import { unitsRouter } from './resources/units/units.router';
import { mainRouter } from './main.router';
import { requestsRouter } from './resources/requests/requests.router';

// instanciar a classe Server
const server = new Server()

/* Invocar o método "bootstrap", que está na classe "Server"
   e que iniciará a aplicação. Este método receberá as instâncias
   das rotas à medida que elas forem sendo exportadas por suas
   respectivas classes, como ocorre com a classe UsersRouters. */
server.bootstrap([
    usersRouter,
    unitsRouter,
    requestsRouter,
    mainRouter
]).then(server => {
    console.log('Server is listening on:', server.application.address())
}).catch(error => {
    console.log('Server failed to start')
    console.error(error)
    process.exit(1) //codigo 1 indica uma saída anormal do programa
})



