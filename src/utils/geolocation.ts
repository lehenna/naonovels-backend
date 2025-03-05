import axios from "axios";

const IP_INFO_KEY = process.env.IP_INFO_KEY ?? "IP_INFO_KEY";

export async function getGeoLocation(ipAddress: string): Promise<{
  city: string;
  country: string;
}> {
  try {
    const res = await axios.get(
      `https://ipinfo.io/${ipAddress}?token=${IP_INFO_KEY}`
    );
    return {
      city: res.data.city,
      country: res.data.country,
    };
  } catch (error) {
    return {
      city: "unknown",
      country: "unknown",
    };
  }
}
