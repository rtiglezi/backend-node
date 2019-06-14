import { ModelRouter } from '../../common/model.router'
import * as restify from 'restify'
import { Unit } from './units.model'

import { authorize } from '../../security/authz.handler';


class UnitsRouter extends ModelRouter<Unit> {

    constructor() {
        super(Unit)
    }

    applyRoutes(application: restify.Server) {
        application.get(`${this.basePath}`, [authorize('admin'), this.findAll])
        application.get(`${this.basePath}/:id`, [authorize('user'), this.validateId, this.findById])
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])
    }
}

export const unitsRouter = new UnitsRouter()