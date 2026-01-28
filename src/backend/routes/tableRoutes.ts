import { Router } from "express";
import { tableController } from "../controllers/tableControllers";
import { authenticateToken } from "../middlewares/jwtAuth";

const tablesRoutes = Router();

// GET routes
tablesRoutes.get("/", authenticateToken, tableController.index);
tablesRoutes.get("/available", authenticateToken, tableController.indexAvailable,);
tablesRoutes.get("/:id", authenticateToken, tableController.show);

// POST routes
tablesRoutes.post("/", authenticateToken, tableController.store);

// PUT routes
tablesRoutes.put("/:id", authenticateToken, tableController.update);

// PATCH routes
tablesRoutes.patch(
  "/:id/status",
  authenticateToken,
  tableController.updateStatus,
);

// DELETE routes
tablesRoutes.delete("/:id", authenticateToken, tableController.delete);

export { tablesRoutes };
