"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGIFY_API_KEY = exports.WEBSITE_URL = exports.PORT = exports.NODE_ENV = void 0;
require("dotenv/config");
exports.NODE_ENV = process.env.NODE_ENV;
exports.PORT = process.env.PORT;
exports.WEBSITE_URL = process.env.WEBSITE_URL;
/**
 * Imagify
 */
exports.IMAGIFY_API_KEY = process.env.IMAGIFY_API_KEY;
//# sourceMappingURL=env.js.map