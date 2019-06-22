"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
/* A classe receberá um modelo genérico, que será enviado
   em runtime (User, Unit etc...), por isso está sendo informado
   o modelo denominado "D" */
class ModelRouter {
    constructor(model) {
        this.model = model;
        /* validação para identificar se o parâmetro
           passado via get corresponde a um id com
           formato válido */
        this.validateId = (req, resp, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Document not found.'));
            }
            else {
                next();
            }
        };
        this.findAll = (req, resp, next) => {
            this.model.find()
                .then(obj => resp.json(obj))
                .catch(next);
        };
        this.findById = (req, resp, next) => {
            this.model.findById(req.params.id)
                .then(obj => resp.json(obj))
                .catch(next);
        };
        this.save = (req, resp, next) => {
            // cria um novo documento com os atributos do body
            let document = new this.model(req.body);
            // salva o documento no banco de dados
            document.save()
                .then(obj => resp.json(obj))
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
                    throw new restify_errors_1.NotFoundError('Document not found.');
                }
            }).then(obj => resp.json(obj))
                .catch(next);
        };
        this.update = (req, resp, next) => {
            /* para que o objeto a ser retornado
               seja o objeto novo, ou seja, o que resultou
               das alterações, utiliza-se a opção a seguir: */
            const options = { runValidators: true, new: true };
            this.model.findByIdAndUpdate(req.params.id, req.body, options)
                .then(obj => resp.json(obj))
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
                    throw new restify_errors_1.NotFoundError('Document not found.');
                }
                return next();
            }).catch(next);
        };
        this.basePath = `/${model.collection.name}`;
    }
}
exports.ModelRouter = ModelRouter;
