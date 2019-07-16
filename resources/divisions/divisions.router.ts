import { authenticate } from './../../security/auth.handler';
import { ModelService } from '../../common/model.service'
import * as restify from 'restify'
import { Division } from './divisions.model'

import { authorize } from '../../security/authz.handler';


class DivisionsRouter extends ModelService<Division> {

    constructor() {
        super(Division)
    }

    findAll = (req, resp, next) => {
        this.model
            .find({
                "tenant_id": req.authenticated.tenant_id
            })
            .sort({name: 1})
            .then(obj => resp.json(obj))
            .catch(next)
    }


    applyRoutes(application: restify.Server) {
        application.get(`${this.basePath}`, [authorize('user'), this.findAll])
        application.get(`${this.basePath}/:id`, [authorize('user'), this.validateId, this.findById])
        application.post(`${this.basePath}`, [authorize('admin'), this.save])
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace])
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update])
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.delete])
    }
}

export const divisionsRouter = new DivisionsRouter()