import uap from "ua-parser-js";

export async function getDeviceInformation(userAgent: string) {
  const ua = uap.UAParser(userAgent);
  return {
    deviceName: ua.device.vendor,
    deviceVersion: ua.device.model,
    browserName: ua.browser.name,
    browserVersion: ua.browser.major,
  };
}
