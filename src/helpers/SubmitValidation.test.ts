import { test } from "node:test";
import assert from "node:assert/strict";
import { demoOwnershipMissing } from "./SubmitValidation";

test("no demo means ownership is not required", () => {
  assert.equal(demoOwnershipMissing({}), false);
  assert.equal(demoOwnershipMissing({ files: {} }), false);
  assert.equal(demoOwnershipMissing({ files: { demoAudio: { base64: "" } } }), false);
});

test("demo without a flag is refused", () => {
  assert.equal(demoOwnershipMissing({ files: { demoAudio: { base64: "abc" } } }), true);
  assert.equal(demoOwnershipMissing({ files: { demoAudio: { base64: "abc" } }, recordingOwned: false }), true);
  assert.equal(demoOwnershipMissing({ files: { demoAudio: { base64: "abc" } }, demoOwned: false }), true);
});

test("demo with recordingOwned or demoOwned is allowed", () => {
  assert.equal(demoOwnershipMissing({ files: { demoAudio: { base64: "abc" } }, recordingOwned: true }), false);
  assert.equal(demoOwnershipMissing({ files: { demoAudio: { base64: "abc" } }, demoOwned: true }), false);
});
