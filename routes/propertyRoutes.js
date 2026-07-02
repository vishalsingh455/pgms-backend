import express from 'express';
import { createPropertyAndInventory, getVisualOccupancyMatrix } from '../controllers/propertyController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validatePropertyCreation } from '../middlewares/validators.js'; // IMPORT SECURITY GUARD

const router = express.Router();

router.use(protect);

// WHY: Added validation guard right between access clearance and core generation execution logic
router.post('/', restrictTo('PropertyOwner', 'SuperAdmin'), validatePropertyCreation, createPropertyAndInventory);
router.get('/:propertyId/occupancy-matrix', restrictTo('PropertyOwner', 'Caretaker', 'SuperAdmin'), getVisualOccupancyMatrix);

export default router;