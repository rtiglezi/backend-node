"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_router_1 = require("./../common/model.router");
const users_model_1 = require("./users.model");
const auth_handler_1 = require("../security/auth.handler");
const authz_handler_1 = require("./../security/authz.handler");
const change_password_handler_1 = require("../security/change-password.handler");
const forgot_password_handler_1 = require("../security/forgot-password.handler");
const reset_password_handler_1 = require("../security/reset-password.handler");
class UsersRouter extends model_router_1.ModelRouter {
    constructor() {
        super(users_model_1.User);
        // findById = (req, resp, next) => {
        //     this.model.findById(req.params.id)
        //               .populate("unit", "name")
        //               .then(this.render(resp,next))
        //               .catch(next)
        // }
        this.findByEmail = (req, resp, next) => {
            if (req.query.email) {
                users_model_1.User.findByEmail(req.query.email)
                    .then(user => user ? [user] : [])
                    .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.url
                }))
                    .catch(next);
            }
            else {
                next();
            }
        };
        /* método "beforeRender" criado no
           router.ts */
        this.on('beforeRender', document => {
            // modificando o documento
            document.password = undefined;
            /* para não mostrar a senha
               após o post de criação de
               novo usuário */
        });
    }
    applyRoutes(application) {
        // rotas para o CRUD de usuarios
        application.get(`${this.basePath}`, [authz_handler_1.authorize('admin'), this.findByEmail, this.findAll]);
        application.get(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authz_handler_1.authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.replace]);
        application.patch(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.validateId, this.delete]);
        // rotas para controle de acesso
        application.post(`${this.basePath}/authenticate`, auth_handler_1.authenticate);
        application.patch(`${this.basePath}/:id/changepass`, [authz_handler_1.authorize('user'), this.validateId, change_password_handler_1.changePassword, this.update]);
        application.post(`${this.basePath}/forgotpass`, forgot_password_handler_1.forgotPassword);
        application.post(`${this.basePath}/resetpass`, reset_password_handler_1.resetPassword);
    }
}
/* instanciar esta classe e disponibilizá-la para
   que outras partes da aplicação possam utilizar,
   por exemplo na invocação do método "bootstrap"
   no arquivo main.ts */
exports.usersRouter = new UsersRouter();
