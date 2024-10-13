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
const file_service_1 = __importDefault(require("./file.service"));
const ImageProcesser_1 = __importDefault(require("../utils/ImageProcesser"));
const DBClient_1 = __importDefault(require("../config/DBClient"));
class ProcessingService {
    processImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ image }) {
            var _b;
            try {
                const downloadedImagePath = yield file_service_1.default.downloadFile({
                    url: image.originalUrl,
                });
                const imageProcessor = new ImageProcesser_1.default({
                    percentage: 50,
                    processType: "normal",
                });
                const processedImage = yield imageProcessor.processImage({
                    imagePath: downloadedImagePath,
                });
                if (!processedImage.success || !processedImage.data) {
                    throw new Error(processedImage.message);
                }
                //updating image url in database
                yield DBClient_1.default.getInstance().image.update({
                    where: { id: image.id },
                    data: {
                        url: (_b = processedImage.data) === null || _b === void 0 ? void 0 : _b.processedImageUrl,
                    },
                });
                // Deleting the downloaded image
                // fs.unlinkSync(downloadedImagePath);
                return {
                    success: true,
                    message: "",
                };
            }
            catch (e) {
                // If not able process the image then replace url with original url
                yield DBClient_1.default.getInstance().image.update({
                    where: { id: image.id },
                    data: {
                        url: image.originalUrl,
                    },
                });
                return {
                    success: false,
                    message: e.message,
                };
            }
        });
    }
    processProductImages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ productId, }) {
            const product = yield DBClient_1.default.getInstance().product.findUnique({
                where: { id: productId },
                include: { images: true },
            });
            if (!product)
                return [];
            // Processing the images
            const processedImages = yield Promise.all(product.images.map((image) => this.processImage({ image })));
            return processedImages.reduce((acc, curr) => {
                if (!curr.success) {
                    acc.push(curr.message);
                }
                return acc;
            }, []);
        });
    }
}
exports.default = ProcessingService;
//# sourceMappingURL=processing.service.js.map