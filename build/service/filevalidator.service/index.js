"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileValidatorInstance = getFileValidatorInstance;
const CSVFileValidator_1 = __importDefault(require("./CSVFileValidator"));
function getFileValidatorInstance({ mimeType, }) {
    switch (mimeType) {
        case CSVFileValidator_1.default.mimeType:
            return new CSVFileValidator_1.default();
        default:
            throw new Error(`Unsupported file type: ${mimeType}`);
    }
}
//# sourceMappingURL=index.js.map