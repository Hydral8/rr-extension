let enableButton = document.getElementById("enableBtn");

enableButton.onclick = (e) => {
  chrome.storage.sync.get(["enabled"], (items) => {
    chrome.storage.sync.set({ enabled: !items.enabled });
    e.target.innerText = items.enabled ? "enable" : "disable";
    chrome.runtime.sendMessage({ enabled: !items.enabled }, (res) => {
      console.log(res);
    });
  });
};
