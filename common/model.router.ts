import { Router } from './router'
import * as mongoose from 'mongoose'
import { NotFoundError } from 'restify-errors'

/* A classe receberá um modelo genérico, que será enviado
   em runtime (User, Unit etc...), por isso está sendo informado
   o modelo denominado "D" */
export abstract class ModelRouter<D extends mongoose.Document> extends Router {

    basePath: string
    pageSize: number = 10

    constructor(protected model: mongoose.Model<D>) {
        super()
        this.basePath = `/${model.collection.name}`
    }

    
    // Utilizado para hypermedia.
    // Faz uma cópia do documento e cria os links
    envelope(document: any): any {
        let resource = Object.assign({ _links: {} }, document.toJSON())
        resource._links.self = `${this.basePath}/${resource._id}`
        return resource
    }

    // passando links de paginação nos recursos
    envelopeAll(documents: any[], options: any = {}): any {
        let resource: any = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        }
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.first = `${this.basePath}`
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`
            }
            const remaining = options.count - (options.page * options.pageSize)
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`
                let last = options.count / options.pageSize
                if (last % 1 === 0) {
                    last = Math.trunc(last)
                } else {
                    last = Math.trunc(last + 1)
                }
                resource._links.last = `${this.basePath}?_page=${last}`
            }
        }
        return resource
    }
    
    
    /* validação para identificar se o parâmetro
       passado via get corresponde a um id com 
       formato válido */
    validateId = (req, resp, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            next(new NotFoundError('Document not found.'))
        } else {
            next()
        }
    }

    findAll = (req, resp, next) => {
        let page = parseInt(req.query._page || 1)
        page = page > 0 ? page : 1
        const skip = (page - 1) * this.pageSize
        this.model // equivale ao model passado em runtime, como o User por exemplo
            .count({})
            .exec()
            .then(count => this.model.find()
                .limit(this.pageSize)
                .skip(skip)
                .then(this.renderAll(
                    resp,
                    next,
                    {
                        page,
                        count,
                        pageSize: this.pageSize,
                        url: req.url
                    }
                )))
            .catch(next)
    }

    findById = (req, resp, next) => {
        this.model.findById(req.params.id)
            .then(this.render(resp, next))
            .catch(next)
    }

    save = (req, resp, next) => {
        // cria um novo documento com os atributos do body
        let document = new this.model(req.body)
        // salva o documento no banco de dados
        document.save()
            .then(this.render(resp, next))
            .catch(next)
    }

    replace = (req, resp, next) => {
        const options = { runValidators: true, overwrite: true }
        this.model.update({ _id: req.params.id }, req.body, options)
            .exec().then(result => {
                if (result.n) {
                    return this.model.findById(req.params.id).exec()
                } else {
                    throw new NotFoundError('Document not found.')
                }
            }).then(this.render(resp, next))
            .catch(next)
    }

    update = (req, resp, next) => {
        /* para que o objeto a ser retornado
           seja o objeto novo, ou seja, o que resultou
           das alterações, utiliza-se a opção a seguir: */
        const options = { runValidators: true, new: true }
        this.model.findByIdAndUpdate(req.params.id, req.body, options)
            .then(this.render(resp, next))
            .catch(next)
    }


    delete = (req, resp, next) => {
        this.model.remove({ _id: req.params.id })
            .exec()
            /* assim como ocorre no update,
               o delete também retorna um sumário */
            .then((cmdResult: any) => {
                if (cmdResult.result.n) {
                    resp.send(204)
                } else {
                    throw new NotFoundError('Document not found.')
                }
                return next()
            }).catch(next)
    }
}