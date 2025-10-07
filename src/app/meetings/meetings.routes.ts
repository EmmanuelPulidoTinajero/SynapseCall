import { Router } from "express"
import { 
    getMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting
} from "./meetings.controller"

const router = Router();

router.get("/", getMeetings);
router.post("/", createMeeting);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);

export default router;