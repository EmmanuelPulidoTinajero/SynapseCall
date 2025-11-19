import dotenv from "dotenv";
dotenv.config();
import express, { static as static_ } from "express";
import path from "path";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerConfig from "../swagger.config"
import { setup, serve } from "swagger-ui-express";
import router from "./app/routes";
import cookieParser from "cookie-parser";
import { dbConnect } from "./database";
import { engine } from "express-handlebars";
import { Server } from "http";
import { Server as SocketServer} from "socket.io";
import { v4 as uuidV4 } from "uuid";

const port = process.env.PORT || 3000;


const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views")
app.use("/static", static_(path.join(__dirname, "..", "public")));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(router);
app.get("", (req, res) => {
    res.redirect(`/meetings/${uuidV4()}`);
});

const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/swagger", serve, setup(swaggerDocs))

//Para cuando esté lista la conexión a la base de datos
dbConnect().then(()=> {
    const server: Server = app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })

    const io = new SocketServer(server, {
    cors: {
        origin: "*"
    }
    });

    io.on("connection", socket => {
        socket.on("join-meeting", (meetingId, userId) => {
            socket.join(meetingId);
            socket.broadcast.to(meetingId).emit("user-connected", userId);
            console.log(meetingId, userId);
            socket.on("disconnect", () => {
                socket.broadcast.to(meetingId).emit("user-disconnected", userId);
            });
        });
    });
})
.catch(() => {
    console.log("Failed to connect to database");
});