"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const file_router_1 = __importDefault(require("./routes/file.router"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)());
app.use("/api", routes_1.default);
app.use("/assets/files", file_router_1.default);
app.get("/health", (req, res) => {
    res.send("OK");
});
app.listen(env_1.PORT, () => {
    console.log(`Server is running on port ${env_1.PORT}`);
});
//# sourceMappingURL=index.js.map