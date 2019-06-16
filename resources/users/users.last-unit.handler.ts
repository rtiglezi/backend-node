import { BadRequestError } from 'restify-errors';
import { User } from './users.model'

export const usersLastUnit = (req, resp, next) => {
  const { id } = req.params
  const lastUnit = req.body.lastUnit

  if (!id || !lastUnit) {

    next(new BadRequestError("User Id and Unit Id are required."))

  } else {

    User.findById(id).then(user => {

      if (user.allowedUnit.indexOf(lastUnit) == -1) {
        next(new BadRequestError("User does not have permission for this Unit."))
      } else {
        req.body.lastUnit = lastUnit
        next()
      }

    }).catch(err => { next(err) })

  }

}

