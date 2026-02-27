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
import { Server as SocketServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import { renderLandingOrHome } from "./app/auth/auth.controller";
import { tryAuthentication } from "./app/middlewares/authentication";
import AgendaItem from "./app/meetings/agenda-item.model"; // Importar Modelo
import Agenda from "./app/meetings/agenda.model";         // Importar Modelo

const port = process.env.PORT || 3000;

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "..", "src", "views"));
app.use("/static", static_(path.join(__dirname, "..", "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/", tryAuthentication, renderLandingOrHome);

app.use(router);

const swaggerDocs = swaggerJsDoc(swaggerConfig);
app.use("/swagger", serve, setup(swaggerDocs))

dbConnect().then(() => {
    const server: Server = app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })

    const peerServer = ExpressPeerServer(server, {
        path: '/'
    });
    app.use('/peerjs', peerServer);

    const io = new SocketServer(server, {
        cors: {
            origin: "*"
        }
    });

    (global as any).io = io;

    io.on("connection", (socket: any) => {
        socket.on("join-meeting", (meetingId: string, userId: string) => {
            socket.join(meetingId);
            socket.broadcast.to(meetingId).emit("user-connected", userId);

            // Chat
            socket.on("message", (data: { message: string, userName: string }) => {
                const body = {
                    userName: data.userName,
                    message: data.message
                };
                io.to(meetingId).emit("message", body);
            });

            // --- LÓGICA DE AGENDA REAL-TIME ---

            // 1. Iniciar Agenda (Host)
            socket.on("agenda-start", async (data: { meetingId: string, firstItemId: string }) => {
                try {
                    const now = new Date();
                    // Actualizar estado en BD
                    const item = await AgendaItem.findByIdAndUpdate(data.firstItemId, {
                        status: 'active',
                        actualStartTime: now
                    }, { new: true });

                    if (item) {
                        // Emitir a TODOS en la sala
                        io.to(meetingId).emit("agenda-update", {
                            currentItem: item,
                            startTime: now.toISOString(),
                            duration: item.durationInMinutes
                        });
                    }
                } catch (e) {
                    console.error("Error starting agenda", e);
                }
            });

            // 2. Siguiente Tema (Host)
            socket.on("agenda-next", async (data: { currentItemId: string, nextItemId: string }) => {
                try {
                    // Cerrar el actual
                    if (data.currentItemId) {
                        await AgendaItem.findByIdAndUpdate(data.currentItemId, { status: 'completed' });
                    }

                    // Iniciar el siguiente
                    const now = new Date();
                    const nextItem = await AgendaItem.findByIdAndUpdate(data.nextItemId, {
                        status: 'active',
                        actualStartTime: now
                    }, { new: true });

                    if (nextItem) {
                        io.to(meetingId).emit("agenda-update", {
                            currentItem: nextItem,
                            startTime: now.toISOString(),
                            duration: nextItem.durationInMinutes
                        });
                    } else {
                        // Fin de la agenda
                        io.to(meetingId).emit("agenda-finished");
                    }
                } catch (e) {
                    console.error("Error updating agenda", e);
                }
            });

            // 3. Detener/Pausar Agenda
            socket.on("agenda-stop", async (data: { currentItemId: string }) => {
               await AgendaItem.findByIdAndUpdate(data.currentItemId, { status: 'completed' });
               io.to(meetingId).emit("agenda-stopped");
            });

            // --- FIN LÓGICA AGENDA ---

            socket.on("disconnect", () => {
                socket.broadcast.to(meetingId).emit("user-disconnected", userId);
            });
        });
    });
})
.catch(() => {
    console.log("Failed to connect to database");
});

export default app;