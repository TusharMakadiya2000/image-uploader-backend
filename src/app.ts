import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sequelize from "./config/db";
import userRoutes from "./routes/userRoutes";
import imageRoute from "./routes/imageRoute";
import companyRoute from "./routes/companyRoute";


const app = express();

// app.use(cors());
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://192.168.160.41:3000"
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Headers", "Origin");
    res.header("Access-Control-Allow-Origin", req.header("origin") || "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    next();
});
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use("/api/users", userRoutes);
app.use("/api/images", imageRoute);
app.use("/api/company", companyRoute);


sequelize
  .sync()
  .then(() => {
    console.log("MySQL connected and synced");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("MySQL connection failed:", err);
  });
