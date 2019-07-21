"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
const router_1 = require("./router");
/* A classe receberá um modelo genérico, que será enviado
   em runtime (User, Unit etc...), por isso está sendo informado
   o modelo denominado "D" */
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        /* validação para identificar se o parâmetro
           passado via get corresponde a um id com
           formato válido */
        this.validateId = (req, resp, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Invalid Id.'));
            }
            else {
                this.model.findById(req.params.id).then(obj => {
                    if (obj) {
                        if (obj.tenant.toString() == req.authenticated.tenant.toString()) {
                            next();
                        }
                        else {
                            next(new restify_errors_1.NotFoundError('Tenant not found.'));
                        }
                    }
                    else {
                        next(new restify_errors_1.NotFoundError('Document not found.'));
                    }
                });
            }
        };
        this.basePath = `/${model.collection.name}`;
    }
}
exports.ModelRouter = ModelRouter;
