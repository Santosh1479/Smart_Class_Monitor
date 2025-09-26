const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./DB/db");

dotenv.config();
connectDB();

const http = require("http");
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});