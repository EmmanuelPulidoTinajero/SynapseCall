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
import { Server } from "https"; // Changed from "http"
import { Server as SocketServer} from "socket.io";
import jwt from "jsonwebtoken";
import { v4 as uuidV4 } from "uuid";
import { ExpressPeerServer } from "peer";
import fs from "fs"; // Import fs module
import https from "https"; // Import https module

const port = process.env.PORT || 3000;

const privateKey = fs.readFileSync(path.join(__dirname, '..', 'certs', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views")
app.use("/static", static_(path.join(__dirname, "..", "public")));
app.use(express.json());
app.use(cookieParser());
app.use(router);

app.get("", (req, res) => {
    const token = req.cookies.accessToken;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as jwt.Secret, (err: any, user: any) => {
            if (err) {
                return res.redirect("/");
            }
            res.redirect(`/meetings/${uuidV4()}`);
        });
    } else {
        res.redirect("/");
    }
});


const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/swagger", serve, setup(swaggerDocs))

//Para cuando esté lista la conexión a la base de datos
dbConnect().then(()=> {
    const httpsServer: Server = https.createServer(credentials, app).listen(port, () => {
        console.log(`Listening on port ${port}`);
    })

    const peerServer = ExpressPeerServer(httpsServer, {
        path: '/'
    });
    app.use('/peerjs', peerServer);

    (global as any).io = new SocketServer(httpsServer, {
    cors: {
        origin: "*"
    }
    });

    (global as any).userSockets = {};

    (global as any).io.on("connection", (socket: any) => {
        socket.on("join-meeting", (meetingId: string, userId: string) => {
            (global as any).userSockets[userId] = socket.id;
            socket.join(meetingId);
            socket.broadcast.to(meetingId).emit("user-connected", userId);
            console.log(meetingId, userId);
            //Chat
            socket.on("message", (data: {message: string, userName:string, breakoutRoomId?: string}) => {
                const body = {
                    userName: data.userName,
                    message: data.message,
                    breakoutRoomId: data.breakoutRoomId // <--- AÑADE ESTA LÍNEA
                };
                if (data.breakoutRoomId) {
                    (global as any).io.to(data.breakoutRoomId).emit("message", body);
                } else {
                    (global as any).io.to(meetingId).emit("message", body);
                }
            });
            socket.on('join-breakout-room', (breakoutRoomId: string) => {
                socket.join(breakoutRoomId);
            });

            socket.on('leave-breakout-room', (breakoutRoomId: string) => {
                socket.leave(breakoutRoomId);
            });

            socket.on("disconnect", () => {
                delete (global as any).userSockets[userId];
                socket.broadcast.to(meetingId).emit("user-disconnected", userId);
            });
        });
    });
})
.catch(() => {
    console.log("Failed to connect to database");
});