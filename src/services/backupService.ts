import axios from "axios";
import { AuthHeader } from "../utils/auth.utils";
import { Config } from "../../config";

/**
 * Backup all system data — returns the raw zip blob from the server.
 */
export const backupAllData = async (): Promise<Blob> => {
  const response = await axios({
    url: `${Config.API_BASE_URL}/backup`,
    method: "GET",
    headers: AuthHeader(),
    responseType: "blob",
  });

  return response.data;
};
