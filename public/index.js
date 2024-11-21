const logDiv = document.getElementById("log");
const logContainerDiv = document.getElementById("logContainer");
const socket = io.connect("http://localhost:5000");
socket.on("connected", (data) => {
  console.log("Socket: ", data);
});

socket.on("log", (data) => {
  logDiv.innerHTML +=
    "<p class='text-green-600 border-l-4 border-green-700 bg-green-600 bg-opacity-20 px-1 py-1'>" + data.log + "</p>";
  logDiv.scrollTop = logDiv.scrollHeight;
  console.log(logDiv.scrollTop, logDiv.scrollHeight);
});

const beginMarketing = async () => {
  const errorDiv = document.getElementById("errorText");
  logDiv.innerHTML = "";
  const privateKey = document.getElementById("privateTextField").value;
  const bnbAmount = document.getElementById("bnbTextField").value;
  const bleggsAmount = document.getElementById("bleggsTextField").value;
  const numOfWallets = document.getElementById("numWalletsTextField").value;
  const purchaseRate = document.getElementById("rateTextField").value;
  const minBuy = document.getElementById("minB").value;
  const maxBuy = document.getElementById("maxB").value;
  const minSell = document.getElementById("minS").value;
  const maxSell = document.getElementById("maxS").value;
  if (
    privateKey === "" ||
    bnbAmount === "" ||
    bleggsAmount === "" ||
    numOfWallets === "" ||
    purchaseRate === "" ||
    minBuy === "" ||
    maxBuy === "" ||
    minSell === "" ||
    maxSell === ""
  ) {
    errorDiv.className = errorDiv.className.replace("hidden", " block");
    errorDiv.innerHTML = "Must fill all data.";
    return;
  }
  if (Number(purchaseRate) > 100 || Number(purchaseRate) < 0) {
    errorDiv.className = errorDiv.className.replace("hidden", " block");
    errorDiv.innerHTML = "Invalid purchase rate! Must be between o and 100!";
    return;
  }
  if (minBuy > maxBuy) {
    errorDiv.className = errorDiv.className.replace("hidden", " block");
    errorDiv.innerHTML = "Invalid input data! maxBuy must be greater than minBuy!";
    return;
  }
  if (minSell > maxSell) {
    errorDiv.className = errorDiv.className.replace("hidden", " block");
    errorDiv.innerHTML = "Invalid input data! maxSell must be greater than minSell!";
    return;
  }
  errorDiv.className = errorDiv.className.replace("block", " hidden");
  errorDiv.innerHTML = "";

  const { data } = await axios.post("http://localhost:5000/begin", {
    socketId: socket.id,
    privateKey: privateKey,
    bnb: bnbAmount,
    bleggs: bleggsAmount,
    numOfWallets: numOfWallets,
    purchaseRate: purchaseRate,
    minB: minBuy,
    maxB: maxBuy,
    minS: minSell,
    maxS: maxSell,
  });

  console.log(data);

  if (data.err) {
    errorDiv.className = errorDiv.className.replace("hidden", " block");
    errorDiv.innerHTML = data.err.name + "<br/>" + (data.err.reason ?? data.err.message ?? "Someting went wrong!");
    logDiv.innerHTML +=
      "<p class='text-red-600 border-l-4 border-red-700 bg-red-600 bg-opacity-20 px-1 py-1'>" +
      "🔴 Marketing Failed!" +
      "</p>";
    logDiv.scrollTop = logDiv.scrollHeight;
    console.log(data.err.error);
  }
};

const showButtonClicked = () => {
  const privateKeyDiv = document.getElementById("privateTextField");
  const showDiv = document.getElementById("show");
  privateKeyDiv.type == "text" ? (privateKeyDiv.type = "password") : (privateKeyDiv.type = "text");
  privateKeyDiv.type == "text" ? (showDiv.innerHTML = "hide") : (showDiv.innerHTML = "show");
};

function isValidEthereumPrivateKey(privateKey) {
  // Check if the private key is a string of 64 hex characters
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  if (typeof privateKey === "string" && hexRegex.test(privateKey)) {
    return true;
  } else {
    return false;
  }
}
