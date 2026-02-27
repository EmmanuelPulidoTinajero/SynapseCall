"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose_1 = require("mongoose");
const dbConnect = () => {
    return new Promise((resolve, reject) => {
        (0, mongoose_1.connect)(process.env.MONGO_URL)
            .then(() => {
            resolve();
        }).catch(() => {
            reject();
        });
    });
};
exports.dbConnect = dbConnect;
