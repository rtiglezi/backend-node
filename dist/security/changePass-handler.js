"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_model_1 = require("./../users/users.model");
const restify_errors_1 = require("restify-errors");
exports.changePassword = (req, resp, next) => {
    const { password, newPassword } = req.body;
    if (req.authenticated.id === req.params.id) {
        users_model_1.User.findByEmail(req.authenticated.email, '+password')
            .then(user => {
            if (password && user && user.matches(password)) {
                if (newPassword) {
                    if (newPassword != password) {
                        req.body = {
                            password: newPassword
                        };
                        //User.update(req, resp, next)
                        resp.json(req);
                        return next();
                    }
                    else {
                        return next(new restify_errors_1.NotAuthorizedError('New password has to be different from current password.'));
                    }
                }
                else {
                    return next(new restify_errors_1.NotAuthorizedError('New password is required.'));
                }
                return next();
            }
            else {
                return next(new restify_errors_1.NotAuthorizedError('Invalid Credentials'));
            }
        });
    }
    else {
        next(new restify_errors_1.ForbiddenError('Permission denied'));
    }
};
