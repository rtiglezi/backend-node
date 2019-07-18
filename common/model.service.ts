
import * as mongoose from 'mongoose'
import { NotFoundError } from 'restify-errors'
import { Router } from './router';

/* A classe receberá um modelo genérico, que será enviado
   em runtime (User, Unit etc...), por isso está sendo informado
   o modelo denominado "D" */
export abstract class ModelService<D extends mongoose.Document> extends Router {

    basePath: string

    constructor(protected model: mongoose.Model<D>) {
        super()
        this.basePath = `/${model.collection.name}`
    }


    /* validação para identificar se o parâmetro
       passado via get corresponde a um id com 
       formato válido */
    validateId = (req, resp, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            next(new NotFoundError('Invalid Id.'))
        } else {
            this.model.findById(req.params.id).then(obj => {
                if (obj) {
                    if ((<any>obj).tenant.toString() == req.authenticated.tenant.toString()) {
                        next()
                    } else {
                        next(new NotFoundError('Tenant not found.'))
                    }
                } else {
                    next(new NotFoundError('Document not found.'))
                }
            })
        }
    }

    findAll = (req, resp, next) => {
        this.model
            .find({
                "tenant": req.authenticated.tenant
            })
            .then(obj => resp.json(obj))
            .catch(next)
    }

    findById = (req, resp, next) => {
        this.model
            .findById(req.params.id)
            .then(obj => {
                resp.json(obj)
            })
            .catch(next)
    }

    save = (req, resp, next) => {
        // insere a identificação do inquilino no "body" da requisição
        req.body.tenant = req.authenticated.tenant
        // cria um novo documento com os atributos do body
        let document = new this.model(req.body)
        // salva o documento no banco de dados
        document.save()
            .then(obj => resp.json(obj))
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
            }).then(obj => resp.json(obj))
            .catch(next)
    }

    update = (req, resp, next) => {

        /* para que o objeto a ser retornado
           seja o objeto novo, ou seja, o que resultou
           das alterações, utiliza-se a opção a seguir: */
        const options = { runValidators: true, new: true }
        this.model.findByIdAndUpdate(req.params.id, req.body, options)
            .then(obj => resp.json(obj))
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