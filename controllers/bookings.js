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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    let status;

    if (today < checkInDate) {
        status = "Upcoming";
    } else if (today > checkOutDate) {
        status = "Completed";
    } else {
        status = "Ongoing";
    }

    const booking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        status,
    });

    await booking.save();

    req.flash("success", "Property booked successfully!");

    res.redirect(`/listings/${id}`);
};

module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id,
    }).populate("listing");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let booking of bookings) {

        if (booking.status === "Cancelled") {
            continue;
        }

        booking.checkIn.setHours(0,0,0,0);
        booking.checkOut.setHours(0,0,0,0);

        if (today < booking.checkIn) {
            booking.status = "Upcoming";
        }
        else if (today > booking.checkOut) {
            booking.status = "Completed";
        }
        else {
            booking.status = "Ongoing";
        }

        await booking.save();
    }

    res.render("bookings/index.ejs", { bookings });
};


module.exports.cancelBooking = async (req, res) => {
    let { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    booking.status = "Cancelled";

    await booking.save();

    req.flash("success", "Booking cancelled successfully!");

    res.redirect("/bookings");
};