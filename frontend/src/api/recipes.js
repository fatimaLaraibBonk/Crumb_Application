import client from "./client";

// Spoonacular's complexSearch returns objects like:
//   { id, title, image, imageType }
// Your backend currently returns that list directly. If you later wrap it in your
// { success, message, data } envelope, this still works.
function normalize(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.results)) return body.results;
  return [];
}

// Spoonacular's free tier has a small daily quota, so we cache the result in memory
// (survives page navigation, resets on refresh) and de-dupe simultaneous calls
// (React StrictMode runs effects twice in dev, which would double-spend your quota).
let cached = null;
let inFlight = null;

export function getRecipes({ force = false } = {}) {
  if (cached && !force) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = client
    .get("/recipes")
    .then((res) => {
      cached = normalize(res.data);
      return cached;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
