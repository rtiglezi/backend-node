import * as restify from 'restify'
import { Tenant } from './tenants.model'
import { authorize } from '../../security/authz.handler';
import { NotFoundError, UnauthorizedError } from 'restify-errors'
import { ModelService } from '../../common/model.service'



class TenantsRouter extends ModelService<Tenant> {

    constructor() {
        super(Tenant)
    }

    findAll = (req, resp, next) => {
    
        /* se o solicitante não tiver o perfil MASTER,
           então filtrar pelo inquilino ao qual ele pertence */
        let query = {}
        if (req.authenticated.profiles.indexOf('master')==-1) {  
            Object.assign(query,{"_id": req.authenticated.tenant})
            console.log(query)
        }

        Tenant
            .find(query)
            .sort({name: 1})
            .then(obj => resp.json(obj))
            .catch(next)
    }

   
    findById = (req, resp, next) => {

        /* se o usuário que fez a requisição não for do tipo MASTER
           e não pertencer ao inquilino buscado, negar o acesso.
           */ 
        if (req.authenticated.profiles.indexOf('master')==-1) {
            if (req.params.id != req.authenticated.tenant) {
                return next(new UnauthorizedError('Access denied to this tenant.'))
            }
        }    

        Tenant
            .findById(req.params.id)
            .then(obj => {
                resp.json(obj)
            })
            .catch(next)
    }

    save = (req, resp, next) => {
        // insere a identificação do inquilino no "body" da requisição
        // cria um novo documento com os atributos do body
        let document = new Tenant(req.body)
        // salva o documento no banco de dados
        document.save()
            .then(obj => resp.json(obj))
            .catch(next)
    }

    replace = (req, resp, next) => {
        const options = { runValidators: true, overwrite: true }
        Tenant.update({ _id: req.params.id }, req.body, options)
            .exec().then(result => {
                if (result.n) {
                    return Tenant.findById(req.params.id).exec()
                } else {
                    throw new NotFoundError('Document not found.')
                }
            }).then(obj => resp.json(obj))
            .catch(next)
    }

    update = (req, resp, next) => {
        const options = { runValidators: true, new: true }
        Tenant.findByIdAndUpdate(req.params.id, req.body, options)
            .then(obj => resp.json(obj))
            .catch(next)
    }

    delete = (req, resp, next) => {
        Tenant.remove({ _id: req.params.id })
            .exec()
            .then((cmdResult: any) => {
                if (cmdResult.result.n) {
                    resp.send(204)
                } else {
                    throw new NotFoundError('Document not found.')
                }
                return next()
            }).catch(next)
    }


    applyRoutes(application: restify.Server) {
        application.get(`/tenants`, [authorize('master', 'admin'), this.findAll])
        application.get(`/tenants/:id`, [authorize('master', 'admin', 'user'), this.findById])
        application.post(`/tenants`, [authorize('master'), this.save])
        application.put(`/tenants/:id`, [authorize('master'), this.replace])
        application.patch(`/tenants/:id`, [authorize('master'), this.update])
        application.del(`/tenants/:id`, [authorize('master'), this.delete])
    }
}

export const tenantsRouter = new TenantsRouter()