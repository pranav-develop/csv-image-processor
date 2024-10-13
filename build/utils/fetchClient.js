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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchClient = void 0;
const fetchClient = (_a) => __awaiter(void 0, [_a], void 0, function* ({ url, method = "GET", headers = {}, payload, }) {
    const res = yield fetch(url, {
        body: payload ? payload : undefined,
        mode: "cors",
        headers: Object.assign({ Accept: "application/json", "Content-Type": "application/json" }, headers),
        method,
    });
    let resobj = null;
    try {
        resobj = yield res.json();
    }
    catch (e) {
        console.log("Error: ", e);
        throw new Error("Unexpected issue. Please try again.");
    }
    return resobj;
});
exports.fetchClient = fetchClient;
//# sourceMappingURL=fetchClient.js.map