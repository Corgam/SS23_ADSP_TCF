import { JsonObject } from "swagger-ui-express";

// Written with the help of ChatGPT
export function compareSingleJson(obj1: JsonObject, obj2: JsonObject): boolean {
  // Check if objects are of the same type
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // Check if both objects are arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return (
      obj1.length === obj2.length &&
      obj1.every((item, index) => compareSingleJson(item, obj2[index]))
    );
  }

  // Check if both objects are objects
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    return Object.keys(obj1).every(
      (key) =>
        Object.prototype.hasOwnProperty.call(obj2, key) &&
        compareSingleJson(obj1[key], obj2[key])
    );
  }

  // For primitive values, perform a simple comparison
  return obj1 === obj2;
}

// Writen also by ChatGPT
export function checkArrayContainsObjects(
  arr: JsonObject[],
  targetArr: JsonObject[]
): boolean {
  if (arr.length !== targetArr.length) {
    console.log(
      `Arrays do not have the same length! (${arr.length} != ${targetArr.length})`
    );
    return false;
  }
  arr.every((obj) => {
    // Check if all key-values exist on the other object
    const exists = targetArr.some((targetObj) =>
      compareSingleJson(obj, targetObj)
    );
    if (!exists) {
      console.log(
        `Object ${JSON.stringify(obj)} does not exist in the other array.`
      );
      return false;
    }
  });
  return true;
}
