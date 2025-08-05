const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let boardState = {};
let currentGridSize = 16;

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.emit("initialGrid", { startingSize: currentGridSize, boardState });

    socket.on("draw", ({ row, col, color }) => {
        let key = `${row},${col}`;
        if (color) {
            boardState[key] = color;
        } else { 
            delete boardState[key];
        }

        socket.broadcast.emit("draw", {row, col, color});
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });

    socket.on("resize", (sizeChoice) => {
        currentGridSize = sizeChoice;
        boardState = {}
        socket.broadcast.emit("resize", sizeChoice);
    });

});

http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
