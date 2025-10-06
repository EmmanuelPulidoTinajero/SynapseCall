import express from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import swaggerJsDoc from "swagger-jsdoc";
import swaggerConfig from "../swagger.config"
import { setup, serve } from "swagger-ui-express";

const port = process.env.PORT || 3000;


const app = express();
app.get("", (req, res) => {
    console.log("all working...");
});

const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/swagger", serve, setup(swaggerDocs))

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})