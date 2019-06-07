"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("./../common/model.router");
const units_model_1 = require("./units.model");
const authz_handler_1 = require("./../security/authz.handler");
class UnitsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(units_model_1.Unit);
    }
    applyRoutes(application) {
        application.get(`${this.basePath}`, this.findAll);
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authz_handler_1.authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.replace]);
        application.patch(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.delete]);
    }
}
exports.unitsRouter = new UnitsRouter();
