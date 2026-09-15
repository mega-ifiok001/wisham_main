// License helpers for WISHAM exclusive sales.

export function generateLicenseHash(beatId, buyerEmail) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-6);
  return `WSH-EXC-${beatId.slice(0, 4).toUpperCase()}-${ts}-${rand}`;
}

/** Filename for the attached license PDF. */
export function licenseFilename(beatTitle) {
  return `WISHAM-Exclusive-License-${beatTitle.replace(/[^a-z0-9]+/gi, '-')}.pdf`;
}