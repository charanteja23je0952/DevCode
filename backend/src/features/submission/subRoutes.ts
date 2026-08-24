import express, { Router } from "express";
import { require_auth } from "../../middleware/authMiddleware.js";
import { get_submissions, add_submission, get_submission_by_id, get_submission_snapshot } from "./subController.js";
const router: Router = express.Router();

router.get(
    '/submissions/question/:id',
    require_auth,
    get_submissions
);

router.get(
    '/submissions/:id/snapshot',
    require_auth,
    get_submission_snapshot
);

router.get(
    '/submissions/:id',
    require_auth,
    get_submission_by_id
);

router.post(
    '/submissions',
    require_auth,
    add_submission
);

export default router;