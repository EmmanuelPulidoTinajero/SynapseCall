"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importStar(require("express"));
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_config_1 = __importDefault(require("../swagger.config"));
const swagger_ui_express_1 = require("swagger-ui-express");
const routes_1 = __importDefault(require("./app/routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./database");
const express_handlebars_1 = require("express-handlebars");
const socket_io_1 = require("socket.io");
const peer_1 = require("peer");
const auth_controller_1 = require("./app/auth/auth.controller");
const authentication_1 = require("./app/middlewares/authentication");
const agenda_item_model_1 = __importDefault(require("./app/meetings/agenda-item.model")); // Importar Modelo
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.engine("handlebars", (0, express_handlebars_1.engine)());
app.set("view engine", "handlebars");
app.set("views", path_1.default.join(__dirname, "views"));
app.use("/static", (0, express_1.static)(path_1.default.join(__dirname, "..", "..", "public")));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.get("/", authentication_1.tryAuthentication, auth_controller_1.renderLandingOrHome);
app.use(routes_1.default);
const swaggerDocs = (0, swagger_jsdoc_1.default)(swagger_config_1.default);
app.use("/swagger", swagger_ui_express_1.serve, (0, swagger_ui_express_1.setup)(swaggerDocs));
(0, database_1.dbConnect)().then(() => {
    const server = app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
    const peerServer = (0, peer_1.ExpressPeerServer)(server, {
        path: '/'
    });
    app.use('/peerjs', peerServer);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*"
        }
    });
    global.io = io;
    io.on("connection", (socket) => {
        socket.on("join-meeting", (meetingId, userId) => {
            socket.join(meetingId);
            socket.broadcast.to(meetingId).emit("user-connected", userId);
            // Chat
            socket.on("message", (data) => {
                const body = {
                    userName: data.userName,
                    message: data.message
                };
                io.to(meetingId).emit("message", body);
            });
            // --- LÓGICA DE AGENDA REAL-TIME ---
            // 1. Iniciar Agenda (Host)
            socket.on("agenda-start", async (data) => {
                try {
                    const now = new Date();
                    // Actualizar estado en BD
                    const item = await agenda_item_model_1.default.findByIdAndUpdate(data.firstItemId, {
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
                }
                catch (e) {
                    console.error("Error starting agenda", e);
                }
            });
            // 2. Siguiente Tema (Host)
            socket.on("agenda-next", async (data) => {
                try {
                    // Cerrar el actual
                    if (data.currentItemId) {
                        await agenda_item_model_1.default.findByIdAndUpdate(data.currentItemId, { status: 'completed' });
                    }
                    // Iniciar el siguiente
                    const now = new Date();
                    const nextItem = await agenda_item_model_1.default.findByIdAndUpdate(data.nextItemId, {
                        status: 'active',
                        actualStartTime: now
                    }, { new: true });
                    if (nextItem) {
                        io.to(meetingId).emit("agenda-update", {
                            currentItem: nextItem,
                            startTime: now.toISOString(),
                            duration: nextItem.durationInMinutes
                        });
                    }
                    else {
                        // Fin de la agenda
                        io.to(meetingId).emit("agenda-finished");
                    }
                }
                catch (e) {
                    console.error("Error updating agenda", e);
                }
            });
            // 3. Detener/Pausar Agenda
            socket.on("agenda-stop", async (data) => {
                await agenda_item_model_1.default.findByIdAndUpdate(data.currentItemId, { status: 'completed' });
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
exports.default = app;
