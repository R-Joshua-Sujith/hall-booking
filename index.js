const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const roomsFilePath = './rooms.json';
const bookingsFilePath = './bookings.json';

// Load rooms from file
let rooms = [];
if (fs.existsSync(roomsFilePath)) {
    const roomsData = fs.readFileSync(roomsFilePath, 'utf8');
    rooms = JSON.parse(roomsData);
}

// Load bookings from file
let bookings = [];
if (fs.existsSync(bookingsFilePath)) {
    const bookingsData = fs.readFileSync(bookingsFilePath, 'utf8');
    bookings = JSON.parse(bookingsData);
}

// Save rooms to file
function saveRooms() {
    const roomsData = JSON.stringify(rooms, null, 2);
    fs.writeFileSync(roomsFilePath, roomsData, 'utf8');
}

// Save bookings to file
function saveBookings() {
    const bookingsData = JSON.stringify(bookings, null, 2);
    fs.writeFileSync(bookingsFilePath, bookingsData, 'utf8');
}

// API endpoint to create a room
app.post('/rooms', (req, res) => {
    const { name, seats, amenities, pricePerHour } = req.body;
    const room = {
        id: rooms.length + 1,
        name,
        seats,
        amenities,
        pricePerHour,
    };
    rooms.push(room);
    saveRooms();
    res.status(201).json(room);
});

// API endpoint to book a room

app.get('/', (req, res) => {
    res.send("Hall Booking Api")
})

app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Check if the room is available for booking on the given date and time
    const isRoomAvailable = bookings.every(
        booking =>
            booking.roomId !== roomId ||
            booking.date !== date ||
            endTime <= booking.startTime ||
            startTime >= booking.endTime
    );

    if (!isRoomAvailable) {
        return res
            .status(400)
            .json({ error: 'Room is already booked for the given date and time.' });
    }

    const booking = {
        id: bookings.length + 1,
        customerName,
        date,
        startTime,
        endTime,
        roomId,
    };
    bookings.push(booking);
    saveBookings();
    res.status(201).json(booking);
});

// API endpoint to list all rooms with booked data
app.get('/rooms/bookings', (req, res) => {
    try {
        const roomsWithBookings = rooms.map(room => {
            const bookedData = bookings.filter(booking => booking.roomId === room.id);
            return {
                roomId: room.id,
                roomName: room.name,
                bookings: bookedData,
            };
        });
        res.json(roomsWithBookings);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to list all customers with booked data
app.get('/customers/bookings', (req, res) => {
    const customersWithBookings = bookings.map(booking => {
        const room = rooms.find(room => room.id === booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room.name,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        };
    });
    res.json(customersWithBookings);
});

// API endpoint to list booking details for a customer

app.get('/customers/:customerName/bookings', (req, res) => {
    const customerName = req.params.customerName;
    const customerBookings = bookings.filter(
        booking => booking.customerName === customerName
    );
    res.json(customerBookings);
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
