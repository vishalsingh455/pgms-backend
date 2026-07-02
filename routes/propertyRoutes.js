import express from 'express';
import { createPropertyAndInventory, getVisualOccupancyMatrix } from '../controllers/propertyController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// WHY: Protect all endpoints in this file. Users must be logged in to access property systems.
router.use(protect);

// WHY: Only PropertyOwners or SuperAdmins should be authorized to design layout properties.
router.post('/', restrictTo('PropertyOwner', 'SuperAdmin'), createPropertyAndInventory);

// WHY: Fetching matrix maps for specific property analytics dashboards.
router.get('/:propertyId/occupancy-matrix', restrictTo('PropertyOwner', 'Caretaker', 'SuperAdmin'), getVisualOccupancyMatrix);

export default router;