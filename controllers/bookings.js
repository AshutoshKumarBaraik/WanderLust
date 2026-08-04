const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.createBooking = async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id);

    let { checkIn, checkOut, guests } = req.body.booking;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
        req.flash("error", "Check-in date cannot be before today!");
        return res.redirect(`/listings/${id}`);
    }

    if (checkOutDate <= checkInDate) {
        req.flash("error", "Checkout date must be after check-in date!");
        return res.redirect(`/listings/${id}`);
    }

    let days =
        (checkOutDate - checkInDate)
        / (1000 * 60 * 60 * 24);

    let totalPrice = listing.price * days;

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

// module.exports.myBookings = async (req, res) => {

//     const bookings = await Booking.find({
//         user: req.user._id,
//     }).populate("listing");

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     for (let booking of bookings) {

//         if (booking.status === "Cancelled") {
//             continue;
//         }

//         booking.checkIn.setHours(0,0,0,0);
//         booking.checkOut.setHours(0,0,0,0);

//         if (today < booking.checkIn) {
//             booking.status = "Upcoming";
//         }
//         else if (today > booking.checkOut) {
//             booking.status = "Completed";
//         }
//         else {
//             booking.status = "Ongoing";
//         }

//         await booking.save();
//     }

//     res.render("bookings/index.ejs", { bookings });
// };
module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id,
    }).populate("listing");

    // console.log(JSON.stringify(bookings, null, 2));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let booking of bookings) {

        if (booking.status === "Cancelled") {
            continue;
        }

        booking.checkIn.setHours(0, 0, 0, 0);
        booking.checkOut.setHours(0, 0, 0, 0);

        if (today < booking.checkIn) {
            booking.status = "Upcoming";
        } else if (today > booking.checkOut) {
            booking.status = "Completed";
        } else {
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