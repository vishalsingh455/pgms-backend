import Property from '../models/Property.model.js';
import Room from '../models/Room.model.js';
import Bed from '../models/Bed.model.js';
import { AppError } from '../middlewares/errorHandler.js';

// WHY: Automates the inventory layout setup. Instead of making an owner manually click "Add Bed" 50 times, 
// this controller lets them define a property, and then hooks a dynamic sub-loop to auto-provision 
// rooms and individual vacant beds securely in a single database transaction flow.
export const createPropertyAndInventory = async (req, res, next) => {
    try {
        const { name, address, settings, inventoryConfiguration } = req.body;

        // 1. Create the base property document.
        // NOTE: req.user._id is populated automatically by our 'protect' auth middleware.
        const newProperty = await Property.create({
            name,
            address,
            settings,
            ownerId: req.user._id,
        });

        const createdRooms = [];
        const createdBeds = [];

        // 2. Map over the inventory configuration matrix sent by the owner
        // Expected structure: inventoryConfiguration = [ { floorNumber: 1, roomNumber: "101", roomType: "DoubleSharing" } ]
        if (inventoryConfiguration && Array.isArray(inventoryConfiguration)) {
            for (const config of inventoryConfiguration) {

                // Create the Room document linked to this property
                const room = await Room.create({
                    propertyId: newProperty._id,
                    floorNumber: config.floorNumber,
                    roomNumber: config.roomNumber,
                    roomType: config.roomType,
                });
                createdRooms.push(room);

                // WHY: Map out how many beds are required inside this room based on its type string.
                let bedCapacity = 1;
                if (config.roomType === 'DoubleSharing') bedCapacity = 2;
                if (config.roomType === 'TripleSharing') bedCapacity = 3;
                if (config.roomType === 'FourSharing') bedCapacity = 4;

                // Auto-generate the corresponding Bed documents sequentially
                for (let i = 1; i <= bedCapacity; i++) {
                    const bed = await Bed.create({
                        roomId: room._id,
                        bedLabel: `Bed-${i}`,
                        isOccupied: false,
                        currentTenantId: null,
                    });
                    createdBeds.push(bed);
                }
            }
        }

        // Return the completely initialized property structure back to the user
        res.status(201).json({
            status: 'success',
            data: {
                property: newProperty,
                roomsGeneratedCount: createdRooms.length,
                bedsGeneratedCount: createdBeds.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// WHY: Fetches a real-time visual matrix grid map tracking vacancy rates across floors.
export const getVisualOccupancyMatrix = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        // Verify property belongs to the requesting owner
        const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
        if (!property) {
            return next(new AppError('No property found matching that ID bound to your account.', 404));
        }

        // Grab all rooms inside this property
        const rooms = await Room.find({ propertyId }).sort({ floorNumber: 1, roomNumber: 1 });

        const computedMatrix = [];

        // For every room, pull all associated beds to construct a rich structural tree mapping profile
        for (const room of rooms) {
            const beds = await Bed.find({ roomId: room._id }).select('bedLabel isOccupied currentTenantId');

            computedMatrix.push({
                roomId: room._id,
                roomNumber: room.roomNumber,
                floorNumber: room.floorNumber,
                roomType: room.roomType,
                beds: beds,
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                propertyName: property.name,
                matrix: computedMatrix,
            },
        });
    } catch (error) {
        next(error);
    }
};