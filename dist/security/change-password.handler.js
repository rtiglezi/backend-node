"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_model_1 = require("../resources/users/users.model");
const restify_errors_1 = require("restify-errors");
exports.changePassword = (req, resp, next) => {
    const { password, newPassword } = req.body;
    if (req.authenticated.id != req.params.id)
        return next(new restify_errors_1.ForbiddenError('Permission denied'));
    users_model_1.User.findByEmail(req.authenticated.email, '+password')
        .then(user => {
        if (!password || !user)
            return next(new restify_errors_1.NotAuthorizedError('Invalid credentials.'));
        if (!user.matches(password))
            return next(new restify_errors_1.NotAuthorizedError('Password is not correct.'));
        if (!newPassword)
            return next(new restify_errors_1.BadRequestError('New password is required.'));
        if (newPassword === password)
            return next(new restify_errors_1.BadRequestError('New password has to be different from current password.'));
        if (newPassword.length < 8)
            return next(new restify_errors_1.BadRequestError('Password has to be at least 8 caracters.'));
        req.body = { password: newPassword };
        return next();
    });
};
