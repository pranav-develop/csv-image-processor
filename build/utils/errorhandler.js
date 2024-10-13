"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendErrorResponse = sendErrorResponse;
const NotFoundError_1 = __importDefault(require("../errors/NotFoundError"));
const GeneralResponse_1 = require("./GeneralResponse");
const InvalidFileError_1 = __importDefault(require("../errors/InvalidFileError"));
function sendErrorResponse(res, error, options) {
    if (error instanceof NotFoundError_1.default) {
        return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
            status: 404,
            hasError: true,
            data: null,
            msg: error.message,
        }));
    }
    if (error instanceof InvalidFileError_1.default) {
        return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
            status: 400,
            hasError: true,
            data: null,
            msg: error.message,
        }));
    }
    return (0, GeneralResponse_1.sendApiResponse)(res, new GeneralResponse_1.GeneralResponse({
        status: (options === null || options === void 0 ? void 0 : options.status) || 500,
        hasError: true,
        data: null,
        msg: (options === null || options === void 0 ? void 0 : options.message) || "Internal Server Error",
    }));
}
//# sourceMappingURL=errorhandler.js.map