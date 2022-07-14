import express from "express";
import controller from "../controllers/primitiveController";
const router = express.Router();

router.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Welcome to the Component API"
    });
});
router.get("/dimensions", controller.getDimensions);
router.get("/terminals", controller.getTerminals);
router.get("/defaults", controller.getDefaults);

export = router;
