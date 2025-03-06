import cors from "cors";

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:7200"],
  // origin: ["http://165.22.218.55:3000", "http://165.22.218.55:7200"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
};

const corsConfig = cors(corsOptions);
export default corsConfig;
