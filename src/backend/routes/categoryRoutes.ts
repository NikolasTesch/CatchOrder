import { Router } from 'express';
import categoryControllers from '../controllers/categoryControllers';
import { authenticateToken } from "../middlewares/jwtAuth";

const categoryRoutes = Router();

categoryRoutes.get("/", authenticateToken, categoryControllers.index);
categoryRoutes.get("/:id", authenticateToken, categoryControllers.show);
categoryRoutes.post("/", authenticateToken, categoryControllers.store);
categoryRoutes.put("/:id", authenticateToken, categoryControllers.update);
categoryRoutes.delete("/:id", authenticateToken, categoryControllers.delete);

export { categoryRoutes };
