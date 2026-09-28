#!/usr/bin/env node
/**
 * Generates an Apple Music (MusicKit) developer token — a JWT signed with
 * your MusicKit private key (ES256). This token is what MusicKit JS needs
 * to talk to the Apple Music API; it is safe to ship to the browser (it
 * cannot act on a user's behalf without their own authorization), but the
 * .p8 private key used to sign it must never be committed or exposed.
 *
 * Usage:
 *   node scripts/generate-apple-music-token.mjs \
 *     --key ./AuthKey_XXXXXXXXXX.p8 \
 *     --keyId XXXXXXXXXX \
 *     --teamId YYYYYYYYYY \
 *     [--expiresInDays 180]
 *
 * Copy the printed token into .env.local as:
 *   NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=eyJ...
 */
import { readFileSync } from "node:fs";
import jwt from "jsonwebtoken";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    if (key) args[key] = argv[i + 1];
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const { key, keyId, teamId, expiresInDays = "180" } = args;

if (!key || !keyId || !teamId) {
  console.error(
    "Brakuje wymaganych argumentów. Użycie:\n" +
      "  node scripts/generate-apple-music-token.mjs --key ./AuthKey_XXXX.p8 --keyId XXXX --teamId YYYY [--expiresInDays 180]"
  );
  process.exit(1);
}

const privateKey = readFileSync(key, "utf8");
const expiresInSeconds = Math.min(Number(expiresInDays), 180) * 24 * 60 * 60;

const token = jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: expiresInSeconds,
  issuer: teamId,
  header: {
    alg: "ES256",
    kid: keyId,
  },
});

console.log("\nWygenerowano Apple Music developer token (ważny 180 dni):\n");
console.log(token);
console.log("\nDodaj do .env.local:\n");
console.log(`NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN=${token}\n`);
