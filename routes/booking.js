const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

const bookingController = require("../controllers/bookings.js");

router.get(
    "/",
    isLoggedIn("Please login to view your bookings!"),
    wrapAsync(bookingController.myBookings)
);

router.post(
    "/",
    isLoggedIn("You must be logged in to book this property!"),
    wrapAsync(bookingController.createBooking)
);

module.exports = router;