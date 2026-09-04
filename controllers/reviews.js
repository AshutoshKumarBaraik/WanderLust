const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// module.exports.createReview = async (req, res) => {
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);
//     newReview.author=req.user._id;

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();
//     req.flash("success","New Review Created!");

//     res.redirect(`/listings/${listing._id}`);
// };

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
};
// module.exports.createReview = async (req, res) => {
//     console.log("Reached createReview");
//     console.log(req.body);

//     let listing = await Listing.findById(req.params.id);
//     console.log("Listing found");

//     let newReview = new Review(req.body.review);
//     console.log("Review object created");

//     newReview.author = req.user._id;

//     listing.reviews.push(newReview);

//     console.log("Saving review...");
//     await newReview.save();

//     console.log("Saving listing...");
//     await listing.save();

//     console.log("Redirecting...");

//     req.flash("success","New Review Created!");
//     res.redirect(`/listings/${listing._id}`);
// };

module.exports.createReview = async (req, res) => {
  // console.log("Inside createReview");

  let listing = await Listing.findById(req.params.id);
  // console.log("Listing found");

  let newReview = new Review(req.body.review);
  // console.log("Review created");

  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  // console.log("Review saved");

  await listing.save();
  // console.log("Listing saved");

  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.validateReview = (req, res, next) => {
  // console.log("Inside validateReview");
  // console.log(req.body);

  let { error } = reviewSchema.validate(req.body);

  if (error) {
    console.log(error);
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  // console.log("Validation Passed");
  next();
};
