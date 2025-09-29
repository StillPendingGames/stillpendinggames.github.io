fetch('../footer.html')
.then(response => response.text())
.then(data => {
  document.getElementById("CurrentYear").textContent = new Date().getFullYear();
});
