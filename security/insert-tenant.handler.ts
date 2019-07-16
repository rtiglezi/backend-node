import * as restify from 'restify'

export const insertTenant: restify.RequestHandler = (req, resp, next) => {
    req.body.tenant_id = req.authenticated.tenant_id
    return next()
}


