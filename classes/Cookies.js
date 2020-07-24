module.exports = class Cookies {
  constructor(cookies) {
    this.cookies = this.mapCookiesToDict(cookies);
  }

  mapCookiesToDict(cookies) {
    let dict = {};

    for (let cookie of cookies) {
      dict[cookie.name] = cookie.value;
    }
    return dict;
  }
};
