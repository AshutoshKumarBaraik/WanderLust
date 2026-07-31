const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.createBooking = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    let { checkIn, checkOut, guests } = req.body.booking;

    let days =
        (new Date(checkOut) - new Date(checkIn))
        / (1000 * 60 * 60 * 24);

    let totalPrice = listing.price * days;

    const booking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
    });

    await booking.save();

    req.flash("success", "Property booked successfully!");

    res.redirect(`/listings/${id}`);
};

module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id,
    }).populate("listing");

    console.log(bookings);

    res.render("bookings/index.ejs", { bookings });
};