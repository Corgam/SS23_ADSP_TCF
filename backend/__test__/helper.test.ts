import { JsonObject } from "swagger-ui-express";
import { expect, describe, it } from "@jest/globals";

describe("CompareSingleJson Helper function works", () => {
  it("Check all queries", async () => {
    // CompareSingleJson tests
    expect(compareSingleJson(query_type1, query_type2)).toBe(false);
    expect(compareSingleJson(query_type1, query2_type1)).toBe(true);
    expect(compareSingleJson(query_type1, query_type2)).toBe(false);
    expect(compareSingleJson(query_type1, query_type3)).toBe(false);
    expect(compareSingleJson(query_type1, query_type4)).toBe(false);
    expect(compareSingleJson(query_type1, query_type1)).toBe(true);
  });
});

describe("checkArrayContainsObjects Helper function works", () => {
  it("Check all arrays", async () => {
    // checkArrayContainsObjects tests
    expect(
      checkArrayContainsObjects(
        [query_type1, query_type2],
        [query_type1, query_type2]
      )
    ).toBe(true);
    expect(
      checkArrayContainsObjects(
        [query_type1, query_type2],
        [query_type2, query_type1]
      )
    ).toBe(true);
    expect(
      checkArrayContainsObjects(
        [query2_type1, query_type1],
        [query_type1, query_type2]
      )
    ).toBe(true);
    expect(
      checkArrayContainsObjects(
        [query2_type1, query_type1],
        [query_type3, query_type2]
      )
    ).toBe(false);
    expect(
      checkArrayContainsObjects(
        [query_type3, query_type2, query_type1],
        [query_type2, query_type1]
      )
    ).toBe(false);
    expect(
      checkArrayContainsObjects(
        [query_type3, query_type2, query_type1],
        [query_type3, query_type1, query_type2]
      )
    ).toBe(true);
  });
});

// Written with the help of ChatGPT
export function compareSingleJson(
  obj1: JsonObject,
  obj2: JsonObject,
  enableLogging = false
): boolean {
  // Check if objects are of the same type
  if (typeof obj1 !== typeof obj2) {
    if (enableLogging) {
      console.log("Objects are not of the same type.");
    }
    return false;
  }

  // Check if both objects are arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    for (let i = 0; i < obj1.length; i++) {
      if (!compareSingleJson(obj1[i], obj2[i], enableLogging)) {
        if (enableLogging) {
          console.log(
            `Not the same values for key "${i}": ${obj1[i]} and ${obj2[i]}.`
          );
        }
        return false;
      }
    }

    return true;
  }

  // Check if both objects are objects
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    const keys1 = Object.keys(obj1);

    for (const key of keys1) {
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
        continue;
      }

      if (!compareSingleJson(obj1[key], obj2[key], enableLogging)) {
        if (enableLogging) {
          console.log(
            `Not the same values for key "${key}": ${obj1[key]} and ${obj2[key]}.`
          );
        }
        return false;
      }
    }

    return true;
  }

  // For primitive values, perform a simple comparison
  return obj1 === obj2;
}

// Writen also by ChatGPT
export function checkArrayContainsObjects(
  arr: JsonObject[],
  targetArr: JsonObject[]
): boolean {
  // Check if the lengths are the same
  if (arr.length !== targetArr.length) {
    return false;
  }
  // Check the objects
  for (const obj of arr) {
    let found = false;
    for (const targetObj of targetArr) {
      if (compareSingleJson(obj, targetObj)) {
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }
  }

  return true;
}

const query_type1 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "new", "photo"],
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};
const query_type2 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "new", "photo"],
  content: {
    url: "someUrl",
    mediaType: "PHOTO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};
const query2_type1 = {
  title: "CatPicture",
  description: "Some pretty cat!",
  dataType: "REFERENCED",
  tags: ["pic", "new", "photo"],
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};
const query_type3 = {
  title: "CatPicture",
  description: "Some pretty dog!",
  dataType: "REFERENCED",
  tags: ["pic", "new", "photo"],
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 0,
      latitude: 0,
    },
  },
};
const query_type4 = {
  title: "CatPicture",
  description: "Some pretty dog!",
  dataType: "REFERENCED",
  tags: ["pic", "new", "photo"],
  content: {
    url: "someUrl",
    mediaType: "VIDEO",
    coords: {
      longitude: 5,
      latitude: 0,
    },
  },
};
