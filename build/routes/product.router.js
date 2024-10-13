"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_controller_1 = __importDefault(require("../controller/product.controller"));
const express_1 = __importDefault(require("express"));
const productRouter = express_1.default.Router();
productRouter.post("/create/csv", product_controller_1.default.uploadProductsCSVHandler);
exports.default = productRouter;
//# sourceMappingURL=product.router.js.map