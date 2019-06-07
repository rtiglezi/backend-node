"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const mongoose = require("mongoose");
const fs = require("fs");
const environment_1 = require("../common/environment");
const merge_patch_parser_1 = require("./merge-patch.parser");
const error_hander_1 = require("./error.hander");
const token_parser_1 = require("../security/token.parser");
class Server {
    // método para iniciar o MongoDB
    initializeDb() {
        mongoose.Promise = global.Promise;
        return mongoose.connect(environment_1.environment.db.url, {
            useMongoClient: true
        });
    }
    /* este método será invocado pelo método "bootstrap", que iniciará a aplicação
       e que passará um array de rotas a serem implementadas aqui */
    initRoutes(routers) {
        return new Promise((resolve, reject) => {
            try {
                const options = {
                    name: 'e-Proc',
                    version: '1.0.0'
                };
                /* informações para utilizar HTTPS
                no ambiente interno, não o de produção */
                if (environment_1.environment.security.enableHTTPS) {
                    options.certificate = fs.readFileSync(environment_1.environment.security.certificate),
                        options.key = fs.readFileSync(environment_1.environment.security.key);
                }
                // criando o servidor e passando as informações sobre a aplicação
                this.application = restify.createServer(options);
                /* definir qual será a porta que será ouvida
                  para chamar a aplicacao */
                this.application.listen(environment_1.environment.server.port, () => {
                    resolve(this.application);
                });
                /* registrar um evento para tratamento centralizado
                   dos erros */
                this.application.on('restifyError', error_hander_1.handleError);
                /* configurar as queries que serão enviadas via get na url
                   para serem mostradas em formato json */
                this.application.use(restify.plugins.queryParser());
                /* utilizar um plugin para fazer o parse do "body" que
                   será enviado nas requisições para um objeto JSON */
                this.application.use(restify.plugins.bodyParser());
                /* realizar o parse manual para que o content-type do
                   método PATCH seja "aplication/merge-patch+json",
                   conforme recomenda a especificação */
                this.application.use(merge_patch_parser_1.mergePatchBodyParser);
                this.application.use(token_parser_1.tokenParser);
                // constante que pegará o ip local
                const ip = require('ip');
                /* percorrer o array de rotas e implementar cada rota por vez,
                   conforme foi definido pela classe abstrata "Router",
                   para que cada recurso consiga aplicar individualmente suas rotas */
                for (let router of routers) {
                    /* então para cada recurso que formos criar,
                       será criada uma classe que herdará da classe
                       abstrata "Router" e aplicará suas rotas. */
                    router.applyRoutes(this.application);
                }
                // registrando as rotas
                this.application.get('/info', [
                    /* esta primeira callback fará testes iniciais
                       antes de continuar a aplicação */
                    (req, resp, next) => {
                        if (req.userAgent() && req.userAgent().includes('MSIE 7.0')) {
                            let error = new Error();
                            error.statusCode = 400;
                            error.message = 'Please, update your browser.';
                            return next(error);
                        }
                        // chamar a próxima callback
                        return next();
                    },
                    /* esta segunda callback finalmente informará
                       dados do browser que acessou o endpoint */
                    (req, resp, next) => {
                        resp.json({
                            localIp: ip.address(),
                            httpVersion: req.httpVersion,
                            browser: req.userAgent(),
                            method: req.method,
                            url: req.url,
                            path: req.path(),
                            query: req.query
                        });
                        return next();
                    }
                ]);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /* Método que será invocado em main.ts para iniciar a aplicação.
       Etapas executadas pelo método:
       -> inicializa o MongoDb;
       -> inicializa as rotas (será passado como parâmetro um array de rotas
                               para que cada rota seja implementada conforme
                               a classe abstrata Router;
       */
    bootstrap(routers = []) {
        return this.initializeDb().then(() => this.initRoutes(routers).then(() => this));
    }
    /* método para finalizar a aplicação,
       que está sendo chamado na finalização dos testes */
    shutdown() {
        return mongoose.disconnect().then(() => this.application.close());
    }
}
exports.Server = Server;
