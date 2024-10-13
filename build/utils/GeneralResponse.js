"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApiResponse = exports.GeneralResponse = void 0;
class GeneralResponse {
    constructor({ status = 200, msg = "", hasError = false, data, }) {
        this.status = status;
        this.msg = msg;
        this.hasError = hasError;
        this.data = data;
    }
    getResponse() {
        return {
            status: this.status,
            msg: this.msg,
            hasError: this.hasError,
            data: this.data,
        };
    }
}
exports.GeneralResponse = GeneralResponse;
const sendApiResponse = (res, response) => {
    return res.status(200).json(response.getResponse());
};
exports.sendApiResponse = sendApiResponse;
//# sourceMappingURL=GeneralResponse.js.map