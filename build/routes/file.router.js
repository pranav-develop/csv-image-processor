"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_controller_1 = __importDefault(require("../controller/file.controller"));
const express_1 = __importDefault(require("express"));
const fileRouter = express_1.default.Router();
fileRouter.get("/:fileName", file_controller_1.default.getFileHandler);
exports.default = fileRouter;
//# sourceMappingURL=file.router.js.map