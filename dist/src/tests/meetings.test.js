"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meetings_controller_1 = require("../app/meetings/meetings.controller");
const meetings_model_1 = __importDefault(require("../app/meetings/meetings.model"));
//mock del para el modelo
jest.mock("../app/meetings/meetings.model", () => ({
    __esModule: true,
    default: {
        //el create
        create: jest.fn(),
        //para el get
        find: jest.fn(),
    },
}));
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe("Meetings", () => {
    const meetingModel = meetings_model_1.default;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("Crear meeting con datos validos", async () => {
        const req = mockReq({
            title: "Presentacion final",
            description: "Una prueba",
            startTime: "2025-12-10T10:00:00.000Z",
            status: "scheduled",
        });
        const res = mockRes();
        const fakeMeeting = {
            id: "1",
            title: "Presentacion final",
            description: "Una prueba",
            startTime: new Date("2025-12-10T10:00:00.000Z"),
            status: "scheduled",
        };
        meetingModel.create.mockResolvedValueOnce(fakeMeeting);
        await (0, meetings_controller_1.createMeeting)(req, res);
        expect(meetingModel.create).toHaveBeenCalledWith(expect.objectContaining({
            title: "Presentacion final",
            description: "Una prueba",
            status: "scheduled",
            startTime: expect.any(Date),
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Meeting created",
            meeting: fakeMeeting,
        });
    });
    test("No se crea la meeting si faltan datos", async () => {
        const req = mockReq({
            title: "hola",
        });
        const res = mockRes();
        await (0, meetings_controller_1.createMeeting)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            message: "Missing meeting information.",
        });
        expect(meetingModel.create).not.toHaveBeenCalled();
    });
    test("No se crea la meeting si el dato de fecha no es correcto", async () => {
        const req = mockReq({
            title: "Meeting rara",
            description: "Desc",
            startTime: "nofecha",
            status: "scheduled",
        });
        const res = mockRes();
        await (0, meetings_controller_1.createMeeting)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({
            message: "Invalid startTime format. Use ISO date string.",
        });
        expect(meetingModel.create).not.toHaveBeenCalled();
    });
    test("Que getMeetings regresa mensaje cuando no hay reuniones disponibles", async () => {
        const req = mockReq();
        const res = mockRes();
        meetingModel.find.mockResolvedValueOnce([]);
        await (0, meetings_controller_1.getMeetings)(req, res);
        expect(meetingModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            message: "No meetings created yet.",
        });
    });
    test("Que getMeetings regresa la lista de reuniones cuando existen", async () => {
        const req = mockReq();
        const res = mockRes();
        const testMeetings = [
            { id: "1", title: "Test1", status: "scheduled" },
            { id: "2", title: "Test2", status: "ended" },
        ];
        meetingModel.find.mockResolvedValueOnce(testMeetings);
        await (0, meetings_controller_1.getMeetings)(req, res);
        expect(meetingModel.find).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            message: "Meetings found.",
            meetings: testMeetings,
        });
    });
});
