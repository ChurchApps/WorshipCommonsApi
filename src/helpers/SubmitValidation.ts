/** True when a demo file is attached but the writer did not confirm ownership. */
export function demoOwnershipMissing(body: {
  files?: { demoAudio?: { base64?: string } };
  recordingOwned?: boolean;
  demoOwned?: boolean;
}): boolean {
  const hasDemo = !!body.files?.demoAudio?.base64;
  const owned = !!(body.recordingOwned || body.demoOwned);
  return hasDemo && !owned;
}
