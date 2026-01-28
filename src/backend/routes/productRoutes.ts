import { Router } from "express";
import { productsController } from "../controllers/productControllers";
import { authenticateToken } from "../middlewares/jwtAuth";

const productsRoutes = Router();

// GET routes
productsRoutes.get("/", authenticateToken, productsController.index);
productsRoutes.get(
  "/active",
  authenticateToken,
  productsController.indexActive,
);
productsRoutes.get("/search", authenticateToken, productsController.search);
productsRoutes.get(
  "/category/:categoryId",
  authenticateToken,
  productsController.indexByCategory,
);
productsRoutes.get(
  "/category/:categoryId/active",
  authenticateToken,
  productsController.indexActiveByCat,
);
productsRoutes.get("/:id", authenticateToken, productsController.show);

// POST routes
productsRoutes.post("/", authenticateToken, productsController.store);

// PUT routes
productsRoutes.put("/:id", authenticateToken, productsController.update);

// PATCH routes
productsRoutes.patch(
  "/:id/deactivate",
  authenticateToken,
  productsController.deactivate,
);
productsRoutes.patch(
  "/:id/activate",
  authenticateToken,
  productsController.activate,
);

// DELETE routes
productsRoutes.delete("/:id", authenticateToken, productsController.delete);

export { productsRoutes };
