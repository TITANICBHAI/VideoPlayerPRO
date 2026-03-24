import { Router, type IRouter } from "express";
import healthRouter from "./health";
import privacyPolicyRouter from "./privacy-policy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(privacyPolicyRouter);

export default router;
