import { BadRequestError } from 'restify-errors';
import { User } from './users.model'

export const usersLastDivision = (req, resp, next) => {
  const { id } = req.params
  const lastDivision = req.body.lastDivision

  if (!id || !lastDivision) {

    next(new BadRequestError("User Id and Division Id are required."))

  } else {

    User.findById(id).then(user => {

      if (user.allowedDivision.indexOf(lastDivision) == -1) {
        next(new BadRequestError("User does not have permission for this Division."))
      } else {
        req.body.lastDivision = lastDivision
        next()
      }

    }).catch(err => { next(err) })

  }

}

