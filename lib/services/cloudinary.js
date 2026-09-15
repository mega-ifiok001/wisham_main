// Cloudinary storage for master WAVs and stem archives.
// Files are uploaded DIRECTLY from the admin's browser (bypassing any serverless
// request-size limit) as `authenticated` assets, so the only way to reach them is
// through our gated download route — which issues a signed, temporary URL.

import crypto from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { config, cloudinaryConfigured } from '../config.js';

// Re-exported so route handlers can import everything Cloudinary-related in one place
export { cloudinaryConfigured };

export const CLD_PREFIX = 'cld:';
const CLDP_PREFIX = CLD_PREFIX;

function sdk() {
  if (!cloudinaryConfigured()) throw new Error('Cloudinary is not configured yet.');
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  return cloudinary;
}

/** "video" for audio, "raw" for zip/rar archives. */
export function resourceTypeFor(filename) {
  return /\.(zip|rar|7z)$/i.test(filename) ? 'raw' : 'video';
}

/**
 * Signature + credentials for a direct browser upload to Cloudinary.
 * The browser POSTs these fields together with the file.
 */
export function createSignedUpload({ filename }) {
  const { cloudName, apiKey, apiSecret, folder } = config.cloudinary;
  if (!cloudinaryConfigured()) throw new Error('Cloudinary is not configured yet.');

  const resourceType = resourceTypeFor(filename);
  const timestamp = Math.floor(Date.now() / 1000) + 900; // signature valid for 15 min
  const params = { folder, timestamp, type: 'authenticated' };

  const signature = sdk().utils.api_sign_request(params, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    type: 'authenticated',
    signature,
    resourceType,
    // Cloudinary endpoint that picks the right handler for the file
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
  };
}

/**
 * Signed delivery URL for an authenticated asset (temporary access is gated by
 * our own download route, which only issues this after validating the sale).
 */
export function signedDeliveryUrl({ resourceType, publicId, filename }) {
  const cld = sdk();
  const url = cld.url(publicId, {
    resource_type: resourceType,
    type: 'authenticated',
    sign_url: true,
    secure: true,
    attachment: filename || true,
  });
  return url;
}

/** true when the stored URL points at a Cloudinary asset ("cld:<type>:<id>"). */
export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.startsWith(CLDP_PREFIX);
}

/** Parse "cld:<resourceType>:<publicId>". */
export function parseCloudinaryUrl(url) {
  const rest = url.slice(CLDP_PREFIX.length);
  const [resourceType, ...restParts] = rest.split(':');
  return { resourceType: resourceType || 'video', publicId: restParts.join(':') };
}