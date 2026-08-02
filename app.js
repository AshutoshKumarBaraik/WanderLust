
require("dotenv").config();

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const bookingRouter = require("./routes/booking.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


let dbUrl = process.env.ATLASDB_URL;


mongoose
    .connect(dbUrl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        console.error("Possible causes: wrong URI, network/DNS, Atlas IP whitelist, or firewall/VPN.");
    });

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, // time period in seconds
    
});

store.on("error",(err)=>{
    console.log("Session store error in mongo",err);
});


const sessionOptions = {
    store : store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now()+7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    }
};




// app.get("/",(req,res)=>{
//     res.send("Hi I am root");
// });





app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser",async(req,res)=>{
//     let fakeUser= new User({
//         email : "student@gmail.com",
//         username : "delta-student",
//     });

//     let registeredUser=await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


app.get("/", (req, res) => {
    return res.redirect("/listings");
});

// Listing Routes
app.use("/listings", listingRouter);

// Review Routes
app.use("/listings/:id/reviews", reviewRouter);

// Booking Routes
app.use("/listings/:id/book", bookingRouter); // Create Booking
app.use("/bookings", bookingRouter);          // My Bookings & Cancel Booking

// User Routes
app.use("/", userRouter);



app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found!!!"));
});

app.use((err,req,res,next)=>{
    let{ statusCode=500,message="something went wrong!!!" }=err;
    res.status(statusCode).render("error.ejs",{ message });
});

app.listen(8080,()=>{
    console.log("server is listening to port : 8080");
});

    // app.get("/testListing",async(req,res)=>{
    //     let sampleListing=new Listing({
    //         title : "My New Villa",
    //         description : "By the beach",
    //         price : 1200,
    //         location : "Calangute,Goa",
    //         country : "India",
    //     });
    
    //     await sampleListing.save();
    //     console.log("sample was saved");
    //     res.send("successful");
    // });