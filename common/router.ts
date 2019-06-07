import * as restify from 'restify'
import { EventEmitter } from 'events';
import { NotFoundError } from 'restify-errors';

/* Esta classe abstrata será usada para organizar as
   rotas como é feito pelo objeto Router do Express.
   Isto está sendo feito porque o restify não tem essa
   funcionalidade. 
   Cada recurso que tivermos na aplicação herdará 
   esta classe para organizar suas rotas.*/
export abstract class Router extends EventEmitter {
    abstract applyRoutes(application: restify.Server)

    // método para aplicar hypermedia nos endpoints que trafegam documentos
    envelope(document: any): any {
        return document
    }

    // metodo para aplicar hypermedia nos endpoints que trafegam arrays
    envelopeAll(documents: any[], options: any = {}): any {
        return documents
    }

    // método para renderizar um documento na rota
    render(response: restify.Response, next: restify.Next) {
        return (document) => {
            if (document) {
                /* Emitir o evento antes da renderização,
                   neste caso a ser ouvido pelo users.router.ts,
                   que o usará para não mostrar a senha do usuário
                   assim que ele é criado via POST */
                this.emit('beforeRender', document)
                response.json(this.envelope(document))
            } else {
                throw new NotFoundError('Documento não encontrado.')
            }
            return next(false)
        }
    }

    /* método para renderizar um array na rota */
    renderAll(response: restify.Response, next: restify.Next, options: any = {}) {
        return (documents: any[]) => {
            if (documents) {
                documents.forEach((document, index, array) => {
                    this.emit('beforeRender', document)
                    array[index] = this.envelope(document)
                })
                response.json(this.envelopeAll(documents, options))
            } else {
                response.json(this.envelopeAll([]))
            }
            return next(false)
        }
    }

}



