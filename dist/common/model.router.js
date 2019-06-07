"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 4;
        /* validação para identificar se o parâmetro
           passado via get corresponde a um id do banco */
        this.validateId = (req, resp, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Document not found'));
            }
            else {
                next();
            }
        };
        this.findAll = (req, resp, next) => {
            let page = parseInt(req.query._page || 1);
            page = page > 0 ? page : 1;
            const skip = (page - 1) * this.pageSize;
            this.model
                .count({})
                .exec()
                .then(count => this.model.find()
                .limit(this.pageSize)
                .skip(skip)
                .then(this.renderAll(resp, next, {
                page, count, pageSize: this.pageSize, url: req.url
            })))
                .catch(next);
        };
        this.findById = (req, resp, next) => {
            this.model.findById(req.params.id)
                .then(this.render(resp, next))
                .catch(next);
        };
        this.save = (req, resp, next) => {
            // cria um novo documento com os atributos do body
            let document = new this.model(req.body);
            // salva o documento no banco de dados
            document.save()
                .then(this.render(resp, next))
                .catch(next);
        };
        this.replace = (req, resp, next) => {
            const options = { runValidators: true, overwrite: true };
            this.model.update({ _id: req.params.id }, req.body, options)
                .exec().then(result => {
                if (result.n) {
                    return this.model.findById(req.params.id).exec();
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado');
                }
            }).then(this.render(resp, next))
                .catch(next);
        };
        this.update = (req, resp, next) => {
            /* para que o objeto a ser retornado
               seja o objeto novo, ou seja, o que resultou
               das alterações, utiliza-se a opção a seguir: */
            const options = { runValidators: true, new: true };
            this.model.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(resp, next))
                .catch(next);
        };
        this.delete = (req, resp, next) => {
            this.model.remove({ _id: req.params.id })
                .exec()
                /* assim como ocorre no update,
                   o delete também retorna um sumário */
                .then((cmdResult) => {
                if (cmdResult.result.n) {
                    resp.send(204);
                }
                else {
                    throw new restify_errors_1.NotFoundError('Documento não encontrado.');
                }
                return next();
            }).catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
    // Utilizado para hypermedia.
    // Faz uma cópia do documento e cria os links
    envelope(document) {
        let resource = Object.assign({ _links: {} }, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`;
        return resource;
    }
    // passando links de paginação nos recursos
    envelopeAll(documents, options = {}) {
        let resource = {
            _links: {
                self: `${options.url}`
            },
            items: documents
        };
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.first = `${this.basePath}`;
                resource._links.previous = `${this.basePath}?_page=${options.page - 1}`;
            }
            const remaining = options.count - (options.page * options.pageSize);
            if (remaining > 0) {
                resource._links.next = `${this.basePath}?_page=${options.page + 1}`;
                let last = options.count / options.pageSize;
                if (last % 1 === 0) {
                    last = Math.trunc(last);
                }
                else {
                    last = Math.trunc(last + 1);
                }
                resource._links.last = `${this.basePath}?_page=${last}`;
            }
        }
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
