// const socket = io.connect("https://smashing-hyena-cute.ngrok-free.app");
const socket = io.connect("http://localhost:5000");

const logDiv = document.getElementById("log");

socket.on("connected", (data) => {
  console.log("Socket: ", data);
});

socket.on("log", (data) => {
  console.log("data: ", data);
  logDiv.innerHTML += "<p>" + data.log + "</p>";
});

const beginMarketing = async () => {
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
  console.log("this is request", minBuy, maxBuy, minSell, maxSell);
  const { data } = await axios.post("https://smashing-hyena-cute.ngrok-free.app/begin", {
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
};

const showButtonClicked = () => {
  const privateKeyDiv = document.getElementById("privateTextField");
  const showDiv = document.getElementById("show");
  console.log(privateKeyDiv.type);
  privateKeyDiv.type == "text" ? (privateKeyDiv.type = "password") : (privateKeyDiv.type = "text");
  privateKeyDiv.type == "text" ? (showDiv.innerHTML = "hide") : (showDiv.innerHTML = "show");
};
