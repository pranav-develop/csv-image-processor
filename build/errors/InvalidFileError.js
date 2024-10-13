"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidFileError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidFileError";
    }
}
exports.default = InvalidFileError;
//# sourceMappingURL=InvalidFileError.js.map