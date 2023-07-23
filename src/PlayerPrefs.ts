export const PlayerPrefs = {
  getString(key: string, defaultValue?: string) {
    const str = get(key);
    if (str) return str;
    if (defaultValue) return defaultValue;
    throw new Error(`PlayerPrefs: Key ${key} not found`);
  },
  setString(key: string, value: string) {
    set(key, value);
  },
  getInt(key: string, defaultValue?: number) {
    const str = get(key);
    if (str) {
      const num = parseFloat(str);
      if (isNaN(num)) {
        throw new Error(`PlayerPrefs: Key ${key} is not a number`);
      }
      if (num !== Math.floor(num)) {
        throw new Error(`PlayerPrefs: Key ${key} is not an integer`);
      }
      return num;
    }
    if (defaultValue) return defaultValue;
    throw new Error(`PlayerPrefs: Key ${key} not found`);
  },
  setInt(key: string, value: number) {
    set(key, value.toString());
  },
  getFloat(key: string, defaultValue?: number) {
    const str = get(key);
    if (str) {
      const num = parseFloat(str);
      if (isNaN(num)) {
        throw new Error(`PlayerPrefs: Key ${key} is not a number`);
      }
      return num;
    }
    if (defaultValue) return defaultValue;
    throw new Error(`PlayerPrefs: Key ${key} not found`);
  },
  setFloat(key: string, value: number) {
    set(key, value.toString());
  },
  setBool(key: string, value: boolean) {
    set(key, value ? "true" : "false");
  },
  getBool(key: string, defaultValue?: boolean) {
    const str = get(key);
    if (str) {
      if (str === "true") return true;
      if (str === "false") return false;
      throw new Error(`PlayerPrefs: Key ${key} is not a boolean`);
    }
    if (defaultValue) return defaultValue;
    throw new Error(`PlayerPrefs: Key ${key} not found`);
  },
  hasKey(key: string) {
    return !!get(key);
  },
  deleteKey(key: string) {
    remove(key);
  },
  deleteAll() {
    deleteAll();
  },
};

function deleteAll() {
  localStorage.clear();
}

function remove(key: string) {
  localStorage.removeItem(key);
}

function get(key: string) {
  return localStorage.getItem(key);
}

function set(key: string, value: string) {
  localStorage.setItem(key, value);
}
