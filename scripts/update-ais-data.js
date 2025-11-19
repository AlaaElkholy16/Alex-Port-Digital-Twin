#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');
const https = require('node:https');

async function loadEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return raw.split(/\r?\n/).reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const [key, ...rest] = trimmed.split('=');
      if (!key) return acc;
      acc[key.trim()] = rest.join('=').trim();
      return acc;
    }, {});
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[update-ais-data] Unable to read .env file:', error.message);
    }
    return {};
  }
}

function mapVesselType(vtype, fallback) {
  const lookup = {
    0: 'Unknown',
    3: 'Tug / Pilot',
    4: 'High Speed',
    6: 'Passenger',
    7: 'Cargo',
    8: 'Tanker',
    9: 'Yacht/Other',
    10: 'Fishing'
  };
  if (typeof vtype === 'number' && lookup[vtype]) return lookup[vtype];
  return fallback || 'Vessel';
}

async function main() {
  const root = process.cwd();
  const envFromFile = await loadEnvFile(path.join(root, '.env'));
  const getEnv = (key, fallback) => process.env[key] ?? envFromFile[key] ?? fallback;

  const apiKey = getEnv('MYSHIPTRACKING_API_KEY');
  const secret = getEnv('MYSHIPTRACKING_SECRET');
  const port = getEnv('MYSHIPTRACKING_PORT', 'Alexandria');
  const endpoint = getEnv('MYSHIPTRACKING_ENDPOINT', 'https://api.myshiptracking.com/v1/ports/vessels');
  const authMode = getEnv('MYSHIPTRACKING_AUTH_MODE', 'query');

  if (!apiKey || !secret) {
    throw new Error('Missing MYSHIPTRACKING_API_KEY or MYSHIPTRACKING_SECRET. Populate your .env file.');
  }

  const url = new URL(endpoint);
  if (port && !url.searchParams.has('port')) {
    url.searchParams.set('port', port);
  }
  url.searchParams.set('format', 'json');

  const headers = { Accept: 'application/json' };
  if (authMode === 'header') {
    headers['X-API-KEY'] = apiKey;
    headers['X-API-SECRET'] = secret;
  } else {
    url.searchParams.set('key', apiKey);
    url.searchParams.set('secret', secret);
  }

  console.log(`[update-ais-data] Fetching AIS data for ${port}...`);
  const payload = await requestJson(url, headers);
  if (payload.status && payload.status !== 'success') {
    throw new Error(`API returned status ${payload.status}: ${payload.message || 'Unknown error'}`);
  }

  const vessels = Array.isArray(payload.data) ? payload.data : [];
  if (!vessels.length) {
    console.warn('[update-ais-data] API response contained no vessels. File will still be updated.');
  }

  const normalized = {
    port,
    timestamp: payload.timestamp || new Date().toISOString(),
    vessels_in_port: vessels.length,
    recent_arrivals: vessels.slice(0, 25).map((vessel) => ({
      vessel_name: vessel.name || `MMSI ${vessel.mmsi}`,
      flag: vessel.flag || 'NA',
      arrival_time: vessel.arrived || null,
      dwt: vessel.dwt ?? null,
      grt: vessel.gt ?? null,
      built_year: vessel.built ?? null,
      length_m: vessel.length ?? null,
      type: vessel.vessel_type || mapVesselType(vessel.vtype, vessel.vessel_type),
      lat: vessel.lat ?? null,
      lng: vessel.lng ?? null
    })),
    expected_arrivals: []
  };

  const dest = path.join(root, 'js', 'data', 'ais-data.js');
  const fileContents = `export const currentAISData = ${JSON.stringify(normalized, null, 2)};\n`;
  await fs.writeFile(dest, fileContents, 'utf8');
  console.log(`[update-ais-data] Updated ${dest} with ${vessels.length} vessels.`);
}

function requestJson(url, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers
    };
    const req = https.request(url, options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`MyShipTracking API responded with ${res.statusCode}: ${raw}`));
        }
        try {
          const json = JSON.parse(raw);
          resolve(json);
        } catch (error) {
          reject(new Error(`Unable to parse API response JSON: ${error.message}`));
        }
      });
    });
    req.on('error', (error) => reject(error));
    req.end();
  });
}

main().catch((error) => {
  console.error('[update-ais-data] Failed to refresh AIS data:', error.message);
  process.exitCode = 1;
});
