const socket = io();

const container = document.querySelector("#container");
let size = 16;

function createGrid(size) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let gridbox = document.createElement("div");
            gridbox.classList.add("gridbox");
            gridbox.dataset.row = row;
            gridbox.dataset.col = col;
            let boxSize = 512 / size;
            gridbox.style.width = `${boxSize}px`;
            gridbox.style.height = `${boxSize}px`;
            container.appendChild(gridbox);
        }
    }
}

createGrid(size);

function mouse() {
    const cells = document.querySelectorAll(".gridbox");
    cells.forEach(cell => {
        cell.addEventListener("mouseenter", (e) => {
            const cell = e.target;
            const row = cell.dataset.row;
            const col = cell.dataset.col;
            if (e.shiftKey) {
                cell.style.removeProperty("background-color");
                socket.emit("draw", {row, col, color: null});
            } else {
                cell.style.backgroundColor = "black";
                socket.emit("draw", {row, col, color: "black"});
            }
        });
    });
}

mouse();

socket.on("initialGrid", ({ startingSize, boardState }) => {
    console.log("initialGrid event received", startingSize, boardState);
    createGrid(startingSize);
    mouse();
    if (Object.keys(boardState).length !== 0) {
        for (let key in boardState) {
            const [row, col] = key.split(",").map(s => s.trim());
            const color = boardState[key];
            const cell = document.querySelector(`.gridbox[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.style.backgroundColor = color;
            }
        }
    }
});


const btn = document.querySelector("button");
btn.addEventListener("click", () => {
    container.innerHTML = "";
    let sizeChoice = 0;
    while (sizeChoice < 1 || sizeChoice >  100) {
        sizeChoice = parseInt(prompt("What dimension (1-100) gridbox would you like? (ex. Enter 64 for 64x64)"));
        if (sizeChoice >= 1 && sizeChoice <= 100) {
            createGrid(sizeChoice);
            mouse();
            socket.emit("resize", sizeChoice);
            break;
        } else {
            alert("Pick a number between 1 and 100.");
        }
    }
})

socket.on("draw", ({row, col, color}) => {
    const cell = document.querySelector(`.gridbox[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        if (color) {
            cell.style.backgroundColor = color;
        } else {
            cell.style.removeProperty("background-color");
        }
    }
});

socket.on("resize", (sizeChoice) => {
    container.innerHTML = "";
    createGrid(sizeChoice);
    mouse();
});
