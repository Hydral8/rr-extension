const Airtable = require("airtable");
const RecordFetch = require("./classes/RecordFetch");
const Cookies = require("./classes/Cookies");
const Config = require("./config.json");

// object containing the immediate previous url of the tab the extension was first enabled on and any created tabs
let history = {};
let retrievedCookies = false;

function SignIn(tabID) {
  // function to sign in the user and retrieve auth session cookie
  chrome.tabs.executeScript(
    tabID,
    {
      file: "signin.js",
    },
    () => {
      console.log("Trying to sign in...");
    }
  );
}

function getCookiesFromPropStream() {
  // get the cookies
  let names = new Set(["_gid", "_ga", "JSESSIONID"]);
  let domainsStrict = new Set([".propstream.com", "app.propstream.com"]);
  return new Promise((res, rej) => {
    chrome.cookies.getAll({ domain: ".propstream.com" }, (cookies) => {
      if (cookies == null) {
        return rej(new Error("There were no cookies"));
      }
      cookies = cookies.filter(
        (cookie) => names.has(cookie.name) && domainsStrict.has(cookie.domain)
      );
      // console.log(cookies)
      let CookieJar = new Cookies(cookies);
      res(CookieJar.cookies);
    });
  });
}

async function toAirtable(cookies) {
  console.log("Current cookies: \n", cookies);
  // note cookies format:
  // cookies._gid, cookies._ga, cookies.JSESSIONID

  // send cookies to airtable using api key (can't really secure since its on browser and no hosting site)

  let base = new Airtable({
    endpointUrl: "https://api.airtable.com",
    apiKey: Config.key,
  }).base(Config.apiURL);

  let reqFetch = new RecordFetch(base);
  let records = await reqFetch.getAllRecords();

  console.log(records);

  if (records.length == 0) {
    await reqFetch.addRecord(cookies);
  } else {
    firstRecord = records.shift();
    if (records.length > 0) {
      await reqFetch.deleteRecords(records);
    }
    await reqFetch.updateRecord(firstRecord, cookies);
  }

  // get all current cookies in airtable. If there's multiple delete them so that there's only ever 1 entry.

  // update that one entry with new cookie data
}

function GetCookie() {
  // Either gets current session cookie or gets a new cookie if you're session is now invalid
  sessCookie = chrome.storage.sync.get(sessCookie);

  chrome.storage.sync.set({ "sess-cookie": value });
}

function visitedApp(tab) {
  if (tab.id in history) {
    if (history[tab.id].includes("https://app.propstream.com/")) {
      return true;
    }
    return false;
  }
}

function directUser(tab, initialPage = false) {
  // check if we're already logged in
  let match = tab.url.match(/(?<type>app|login).propstream/i);
  if (match == null) {
    // send to login if we're not at login or app
    sendToLogin(tab);
  } else if (match.groups["type"].toLowerCase() == "app") {
    if (!visitedApp(tab) || !retrievedCookies) {
      if (initialPage || tab.url == "https://app.propstream.com/search") {
        // get cookies if we're initially at app or we've logged into the propstream homepage
        getCookiesFromPropStream().then((cookies) => {
          retrievedCookies = true;
          toAirtable(cookies);
        });
      }
    }
  } else if (match.groups["type"].toLowerCase() == "login") {
    // set prevUrl in history to login page so we don't try to resign in if we fail authentication and get redirected
    if (initialPage) history[tab.id] = tab.url;

    // send to app if we're currently at login
    SignIn();
  }
}

function sendToLogin(tab) {
  chrome.tabs.update(
    tab.id,
    {
      url: "https://login.propstream.com/",
    },
    () => {
      console.log("Sent user to propstream");
    }
  );
}

function checkAuth(tabId, changeInfo, tab) {
  let prevUrl = "No prev URL";
  if (tab.id in history) {
    prevUrl = history[tab.id];
  }

  // check if we're simply reloading the tab or a redirect (prevents infinite loops)
  if (prevUrl == tab.url) {
    return;
  } else {
    // check authenatication status and if signed out, resign in and reset cookie
    history[tab.id] = tab.url;
    directUser(tab);
  }
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ enabled: false }, () => {
    console.log("SUCCESS");
  });
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.enabled) {
      chrome.storage.sync.set({ sentToLogin: false });
      chrome.browserAction.setBadgeText({ text: "ON" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#4688F1" });
      // if request is enabled, send user to propstream. Query gives a list of tabs, only need first one
      chrome.tabs.query({ active: true }, (tabs) => directUser(tabs[0], true));
      // check for signout
      chrome.tabs.onUpdated.addListener(checkAuth);
      chrome.tabs.onCreated.addListener(sendToLogin);
      // chrome.tabs.onCreated()
    } else {
      chrome.browserAction.setBadgeText({ text: "OFF" });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#EF8841" });

      chrome.tabs.onUpdated.removeListener(checkAuth);
      chrome.tabs.onCreated.removeListener(sendToLogin);
    }
    sendResponse(request);
  });
});
