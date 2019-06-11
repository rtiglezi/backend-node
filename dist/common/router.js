"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const restify_errors_1 = require("restify-errors");
/* Esta classe abstrata será usada para organizar as
   rotas como é feito pelo objeto Router do Express.
   Isto está sendo feito porque o restify não tem essa
   funcionalidade.
   Cada recurso que tivermos na aplicação herdará
   esta classe para organizar suas rotas.*/
class Router extends events_1.EventEmitter {
    // método para aplicar hypermedia nos endpoints que trafegam documentos
    envelope(document) {
        return document;
    }
    // metodo para aplicar hypermedia nos endpoints que trafegam arrays
    envelopeAll(documents, options = {}) {
        return documents;
    }
    // método para renderizar um documento na rota
    render(response, next) {
        return (document) => {
            if (document) {
                /* Emitir o evento antes da renderização,
                   neste caso a ser ouvido pelo users.router.ts,
                   que o usará para não mostrar a senha do usuário
                   assim que ele é criado via POST */
                this.emit('beforeRender', document);
                response.json(this.envelope(document));
            }
            else {
                throw new restify_errors_1.NotFoundError('Document not found.');
            }
            return next(false);
        };
    }
    /* método para renderizar um array na rota */
    renderAll(response, next, options = {}) {
        return (documents) => {
            if (documents) {
                documents.forEach((document, index, array) => {
                    this.emit('beforeRender', document);
                    array[index] = this.envelope(document);
                });
                response.json(this.envelopeAll(documents, options));
            }
            else {
                response.json(this.envelopeAll([]));
            }
            return next(false);
        };
    }
}
exports.Router = Router;
