const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isOwner , validateListing }=require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
    isLoggedIn("You must be logged in to create a listing!"),
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
);


//New route
router.get(
    "/new",
    isLoggedIn("Please login to create a listing!"),
    listingController.renderNewForm
);

router.route("/:id")
    .get( wrapAsync(listingController.showListings))
    .put(
        isLoggedIn("Please login to update this listing!"),
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn("Please login to delete this listing!"),
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


router.get(
    "/:id/book",
    isLoggedIn("You must be logged in to book this property!"),
    wrapAsync(listingController.renderBookingForm)
);

//listing index route
// router.get("/",wrapAsync(listingController.index));


//show route
// router.get("/:id", wrapAsync(listingController.showListings));


//create route
// router.post("/", isLoggedIn , validateListing , wrapAsync(listingController.createListing));

//Edit route
router.get(
    "/:id/edit",
    isLoggedIn("Please login to edit this listing!"),
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

//update route
// router.put("/:id", isLoggedIn, isOwner ,validateListing, wrapAsync(listingController.updateListing));

//Delete Route
// router.delete("/:id", isLoggedIn , isOwner ,wrapAsync(listingController.destroyListing));

module.exports=router;