"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const restify_errors_1 = require("restify-errors");
const users_model_1 = require("../resources/users/users.model");
const environment_1 = require("../common/environment");
const tenants_model_1 = require("../resources/tenants/tenants.model");
exports.authenticate = (req, resp, next) => {
    const { email, password } = req.body;
    users_model_1.User.findByEmail(email, '+password')
        .then(user => {
        if (!user || !user.matches(password))
            return next(new restify_errors_1.UnauthorizedError('Invalid credentials'));
        let payload = {
            sub: user.email,
            iss: 'e-proc-api',
            tnt: user.tenant
        };
        const token = jwt.sign(payload, environment_1.environment.security.apiSecret, { expiresIn: '8h' });
        tenants_model_1.Tenant.findById(user.tenant)
            .then(tenant => {
            resp.json({
                tenant: tenant.alias,
                name: user.name,
                email: user.email,
                accessToken: token,
                profiles: user.profiles
            });
            return next(false);
        });
    }).catch(next);
};
