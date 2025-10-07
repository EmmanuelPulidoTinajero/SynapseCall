import { Router } from "express"
import { 
    getMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting
} from "./meetings.controller"

const router = Router();

router.get("/meeting/", getMeetings);
router.post("/meeting/", createMeeting);
router.put("/meeting/:id", updateMeeting);
router.delete("/meeting/:id", deleteMeeting);

export default router;