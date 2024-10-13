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
const fs_1 = __importDefault(require("fs"));
const fetchClient_1 = require("../utils/fetchClient");
const form_data_1 = __importDefault(require("form-data"));
const env_1 = require("../env");
class ImageProcessor {
    constructor({ percentage, processType }) {
        this.percentage = percentage;
        this.processType = processType;
    }
    createFormData({ filePath }) {
        const formData = new form_data_1.default();
        formData.append("image", fs_1.default.createReadStream(filePath));
        formData.append("data", JSON.stringify({
            resize: {
                percentage: this.percentage,
            },
            normal: this.processType === "normal",
            aggressive: this.processType === "aggressive",
            ultra: this.processType === "ultra",
        }));
        return formData;
    }
    makeProcessRequest(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageData = yield (0, fetchClient_1.fetchClient)({
                url: "https://app.imagify.io/api/upload",
                method: "POST",
                headers: {
                    Authorization: `token ${env_1.IMAGIFY_API_KEY}`,
                    "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                },
                payload: formData,
            });
            if (imageData.code !== 200) {
                switch (imageData.code) {
                    case 422:
                        throw new Error("ImageAlready Compressed");
                    case 415:
                        throw new Error("Invalid media format");
                }
            }
            return imageData;
        });
    }
    processImage(_a) {
        return __awaiter(this, arguments, void 0, function* ({ imagePath, }) {
            try {
                // Check if the file exists
                if (!fs_1.default.existsSync(imagePath)) {
                    throw new Error("File not found");
                }
                //calling the process function
                const formData = this.createFormData({ filePath: imagePath });
                const processedImage = yield this.makeProcessRequest(formData);
                return {
                    success: true,
                    message: "Image processed successfully",
                    data: {
                        processedImageUrl: processedImage.image,
                    },
                };
            }
            catch (e) {
                return {
                    success: false,
                    message: `Failed to process image: ${e.message}`,
                    data: null,
                };
            }
        });
    }
}
exports.default = ImageProcessor;
//# sourceMappingURL=ImageProcesser.js.map