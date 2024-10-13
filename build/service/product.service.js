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
const DBClient_1 = __importDefault(require("../config/DBClient"));
const csv_1 = __importDefault(require("../utils/csv"));
const path_1 = __importDefault(require("path"));
class ProductService {
    static createProductFromCSV(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file }) {
            const csvData = yield csv_1.default.parseCSVFile({
                filepath: `${path_1.default.join(file.path, file.id)}.${file.extension}`,
            });
            const rawProductsData = csvData.rows.map((row) => {
                return {
                    name: row["Product Name"],
                    images: row["Input Image Urls"]
                        .split(",")
                        .filter((item) => item.length > 0),
                };
            });
            return Promise.all(rawProductsData.map((product) => {
                return this.createProduct(product);
            }));
        });
    }
    static createProduct(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, images, }) {
            return DBClient_1.default.getInstance().$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const currentImages = yield Promise.all(images.map((image) => {
                    return tx.image.create({
                        data: {
                            originalUrl: image,
                        },
                    });
                }));
                return yield tx.product.create({
                    data: {
                        name,
                        images: {
                            connect: currentImages.map((image) => {
                                return { id: image.id };
                            }),
                        },
                    },
                });
            }));
        });
    }
}
exports.default = ProductService;
//# sourceMappingURL=product.service.js.map