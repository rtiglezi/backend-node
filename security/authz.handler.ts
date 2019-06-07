import * as restify from 'restify'
import { ForbiddenError } from 'restify-errors'

export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
  return (req, resp, next) => {
    console.log("req.authenticated:", req.authenticated)
    console.log("...profiles:", ...profiles)
    if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
      next()
    } else {
      next(new ForbiddenError('Permission denied'))
    }
  }
}