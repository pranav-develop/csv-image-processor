"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_service_1 = __importDefault(require("../service/file.service"));
const errorhandler_1 = require("../utils/errorhandler");
class FileController {
    static getFileHandler(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fileName } = req.params;
                const path = file_service_1.default.uploadsDirectoryPath();
                const filePath = `${path}/${fileName}`;
                return res.status(200).sendFile(filePath);
            }
            catch (e) {
                return (0, errorhandler_1.sendErrorResponse)(res, e, {
                    message: "Error while fetching file",
                    status: 500,
                });
            }
        });
    }
}
exports.default = FileController;
//# sourceMappingURL=file.controller.js.map