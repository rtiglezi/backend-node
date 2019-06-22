import { ModelService } from '../../common/model.service'
import * as restify from 'restify'
import { Division } from './divisions.model'

import { authorize } from '../../security/authz.handler';


class DivisionsRouter extends ModelService<Division> {

    constructor() {
        super(Division)
    }

    applyRoutes(application: restify.Server) {
        application.get(`${this.basePath}`, [this.findAll])
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById])
        application.post(`${this.basePath}`, [this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])
    }
}

export const divisionsRouter = new DivisionsRouter()