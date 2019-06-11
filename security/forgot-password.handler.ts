import * as restify from 'restify'
import { User } from '../users/users.model'
import { NotFoundError } from 'restify-errors'

import * as bcrypt from 'bcrypt'
import { environment } from './../common/environment';
import * as jwt from 'jsonwebtoken'


export const forgotPassword: restify.RequestHandler = (req, resp, next) => {
  const { email } = req.body

  User.findByEmail(email, '+password')
    .then(user => {
      if(!user)
        return next(new NotFoundError('E-mail not found.'))
        bcrypt.hash(user.password, environment.security.saltRounds)
        .then(hash => {
            const token = jwt.sign({ sub: user.email, iss: 'e-proc-api' }, environment.security.apiSecret, { expiresIn: '10h' })
            resp.json({token})
        }).catch(next)
    })
    
}