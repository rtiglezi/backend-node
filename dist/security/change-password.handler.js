"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_model_1 = require("../resources/users/users.model");
const restify_errors_1 = require("restify-errors");
exports.changePassword = (req, resp, next) => {
    const { password, newPassword } = req.body;
    users_model_1.User.findByEmail(req.authenticated.email, '+password')
        .then(user => {
        if (!password)
            return next(new restify_errors_1.BadRequestError('Password is required.'));
        if (!user.matches(password))
            return next(new restify_errors_1.NotAuthorizedError('Password is not correct.'));
        if (!newPassword)
            return next(new restify_errors_1.BadRequestError('New password is required.'));
        if (newPassword === password)
            return next(new restify_errors_1.BadRequestError('New password must to be different from current password.'));
        if (newPassword.length < 8)
            return next(new restify_errors_1.BadRequestError('Password must to be at least 8 characters.'));
        req.body = { password: newPassword };
        return next();
    }).catch(err => { next(err); });
};
