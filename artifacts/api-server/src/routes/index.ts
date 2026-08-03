import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dockerRouter from "./docker";
import configRouter from "./config";
import servicesRouter from "./services";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dockerRouter);
router.use(configRouter);
router.use(servicesRouter);

export default router;
