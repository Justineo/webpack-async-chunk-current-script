console.log(document.currentScript);

document.getElementById("output").textContent = document.currentScript
  ? document.currentScript.src
  : "null";
