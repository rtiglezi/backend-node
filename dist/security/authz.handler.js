"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_errors_1 = require("restify-errors");
exports.authorize = (...profiles) => {
    return (req, resp, next) => {
        console.log("req.authenticated:", req.authenticated);
        console.log("...profiles:", ...profiles);
        if (req.authenticated !== undefined && req.authenticated.hasAny(...profiles)) {
            next();
        }
        else {
            next(new restify_errors_1.ForbiddenError('Permission denied'));
        }
    };
};
