import ProductController from "controller/product.controller";
import express from "express";

const productRouter = express.Router();

productRouter.post("/create/csv", ProductController.uploadProductsCSVHandler);

export default productRouter;
