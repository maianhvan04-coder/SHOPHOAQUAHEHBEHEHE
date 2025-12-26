const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require("./src/api/v1/routes/api.routes");
const { errorMiddleware } = require("./src/api/v1/middlewares/error.middleware");
const { notFoundMiddleware } = require("./src/api/v1/middlewares/notFound.middleware");

const configViewEngine = require("./src/config/viewEngine");

const app = express();

// middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
];

// view engine (OPTIONAL)
configViewEngine(app);


//cors
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);


// routes
apiRoutes(app)


// 404 sau routes
app.use(notFoundMiddleware);

// error handler CUỐI CÙNG
app.use(errorMiddleware);
module.exports = app;
