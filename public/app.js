let bytesAmount = 0;
const ioClient = io.connect(window.location.href);
ioClient.on("connect", (msg) => console.log("connected"));

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    );
}

function updateStatus(size) {
    const text = `Missing upload ${formatBytes(size)}`;
    document.getElementById("size").innerHTML = text;
}
ioClient.on("file-uploaded", (msg) => {
    console.log("uploaded!", msg);
    bytesAmount = bytesAmount - msg;
    updateStatus(bytesAmount);
});

const showSize = () => {
    const input = document.getElementById("file");
    const file = input.files[0];
    if (!file) return;

    bytesAmount = file.size;
    updateStatus(file.size);
};

window.showSize = showSize;