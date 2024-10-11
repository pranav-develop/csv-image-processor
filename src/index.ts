import { PORT } from "env";
import express, { Request, Response } from "express";
import router from "routes";
import fileUpload from "express-fileupload";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());

app.use("/api", router);

app.get("/health", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
