interface Location {
  pathname: string;
  search: string;
  hash?: string;
}

interface HashHistory {
  getCurrentLocation(): Location;
  push(path: string): void;
  replace(path: string): void;
  listen(fn: (location: Location) => void): () => void;
  readonly location: Location;
}

function getLocation(): Location {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const [pathname, search = ""] = hash.split("?");
  return {
    pathname: pathname || "/",
    search: search ? "?" + search : "",
    hash: window.location.hash,
  };
}

const hashHistory: HashHistory = {
  getCurrentLocation: getLocation,
  push(path) {
    window.location.hash = path;
  },
  replace(path) {
    const href = window.location.href.replace(/(#[^!]*)?$/, "") + "#" + path;
    window.location.replace(href);
  },
  listen(fn) {
    const handler = () => fn(getLocation());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  },
  get location() {
    return getLocation();
  },
};

export default hashHistory;
