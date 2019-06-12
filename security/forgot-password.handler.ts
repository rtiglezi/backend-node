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
        .then(() => {
            let payload = {
              sub: user.email, 
              iss: 'e-proc-api'
            }
            const token = jwt.sign(payload, environment.security.emailSecret, { expiresIn: '1h' })
            
            /* o token deverá ser encaminhado ao usuário via e-mail,
               juntamente com um link com acesso para a tela de alteração da senha */
            resp.json({token})
        
          }).catch(next)
    })
    
}