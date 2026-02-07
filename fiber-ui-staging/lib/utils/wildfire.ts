import axios from "axios";
import * as CryptoJS from "crypto-js";

// Wildfire authentication credentials
const WILDFIRE_CLIENT_API_KEY = process.env.WILDFIRE_CLIENT_API_KEY;
const WILDFIRE_CLIENT_APPLICATION_ID = process.env.WILDFIRE_CLIENT_APPLICATION_ID;

/**
 * Generate WFAV1 authorization header
 * Based on the Wildfire API Authorization Pre-request Script
 */
function generateWFAV1Authorization(deviceTokenParam?: string): {
  authorization: string;
  wfDateTime: string;
} {
  if (!WILDFIRE_CLIENT_APPLICATION_ID || !WILDFIRE_CLIENT_API_KEY) {
    throw new Error("WILDFIRE_CLIENT_APPLICATION_ID and WILDFIRE_CLIENT_API_KEY must be set");
  }

  const appID = WILDFIRE_CLIENT_APPLICATION_ID.trim();
  const appKey = WILDFIRE_CLIENT_API_KEY.trim();

  // Use provided device token or the cached one
  const currentDeviceToken = deviceTokenParam || "";

  // NOTE: senderToken is only used inside Wildfire for internal operations.
  // Wildfire partners should set this to an empty string.
  const senderToken = "";

  // Generate a timestamp for the request
  const wfTime = new Date().toISOString();

  // Create the auth headers
  const stringToSign = [wfTime, currentDeviceToken, senderToken].join("\n") + "\n";
  const appSignature = CryptoJS.HmacSHA256(stringToSign, appKey).toString(CryptoJS.enc.Hex);
  const authorization = `WFAV1 ${[appID, appSignature, currentDeviceToken, senderToken].join(":")}`;

  return {
    authorization,
    wfDateTime: wfTime,
  };
}

/**
 * Register a device with Wildfire API and get device token
 * Based on the Wildfire API Authorization Pre-request Script
 * @param deviceKey Optional device key for existing device sessions. Only pass if you're creating a session for an existing device.
 * @returns The device token and device key
 */
export async function registerWildfireDevice(deviceKey?: string): Promise<{
  deviceToken: string;
  deviceKey: string;
  deviceId: string;
}> {
  try {
    if (!WILDFIRE_CLIENT_APPLICATION_ID || !WILDFIRE_CLIENT_API_KEY) {
      throw new Error("WILDFIRE_CLIENT_APPLICATION_ID and WILDFIRE_CLIENT_API_KEY must be set");
    }

    // Log whether we're creating a new device or using an existing one
    if (deviceKey) {
      console.log(
        `Creating session for existing Wildfire device with key: ${deviceKey.slice(0, 8)}...`,
      );
    } else {
      console.log("Creating new Wildfire device registration");
    }

    // Generate auth headers without device token (first request)
    const { authorization, wfDateTime } = generateWFAV1Authorization();

    // Only include DeviceKey in POST body if provided (for existing device sessions)
    const requestBody: { DeviceKey?: string } = {};
    if (deviceKey) {
      requestBody.DeviceKey = deviceKey;
    }

    const apiUrl = "https://api.wfi.re/v2/device";

    console.log(`Registering device with Wildfire API at ${apiUrl}`);

    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        Authorization: authorization,
        "X-WF-DateTime": wfDateTime,
        "User-Agent": "Moonwalk-Wildfire-Integration",
        "Content-Type": "application/json",
      },
    });

    const { DeviceToken, DeviceKey, DeviceID } = response.data;

    console.log({ responseData: response.data });

    console.log(
      `Successfully registered device with Wildfire. Device token: ${DeviceToken?.slice(
        0,
        8,
      )}..., Device key: ${DeviceKey?.slice(0, 8)}..., Device ID: ${DeviceID || "undefined"}`,
    );

    return {
      deviceToken: DeviceToken,
      deviceKey: DeviceKey,
      deviceId: DeviceID,
    };
  } catch (error) {
    console.error("Error registering Wildfire device", { error, deviceKey });
    throw error;
  }
}

/**
 * Generate a Wildfire device ID by registering with the API
 * @returns The generated device ID
 */
export async function generateWildfireDeviceId(): Promise<string> {
  try {
    console.log("Generating Wildfire device token ... 📱 📱 📱");

    // Register a new device and get the token
    const { deviceId: newDeviceId } = await registerWildfireDevice();

    console.log(`Created new device ID: ${newDeviceId}`);
    return newDeviceId.toString();
  } catch (error) {
    console.error("Error getting or creating device token", { error });
    throw error;
  }
}
