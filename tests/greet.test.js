import assert from "node:assert/strict";
import { greet } from "../src/index.js";

assert.equal(greet("world"), "Hello, world!");

let errorCaught = false;
try {
  greet("");
} catch (error) {
  errorCaught = error instanceof Error;
}

assert.equal(errorCaught, true, "greet should throw when no name is provided");
