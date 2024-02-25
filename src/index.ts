import express from "express";
import router from "./router";
const app = express();

app.use(express.json());

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello from Nodejs API");
});

app.use("/", router());
