import dotenv from "dotenv";
dotenv.config();
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerConfig from "../swagger.config"
import { setup, serve } from "swagger-ui-express";
import router from "./app/routes";
import cookieParser from "cookie-parser"; 
import { dbConnect } from "./database";

const port = process.env.PORT || 3000;


const app = express();
// app.engine("handlebars", engine());
// app.set("view engine", "handlebars");
// app.set("views", "./src/views")
// app.use("/static", static_(path.join(__dirname, "..", "public")));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); 
app.use(router);
app.get("", (req, res) => {
    console.log("all working...");
});

const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/swagger", serve, setup(swaggerDocs))

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

//Para cuando esté lista la conexión a la base de datos
dbConnect().then(()=> {
    app.listen(port, () => {
        console.log(`Server runnning on port ${port}`);
    })
})
.catch(() => {
    console.log("Failed to connect to database");
})