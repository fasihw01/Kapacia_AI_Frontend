import { GetApiData } from "../../utils/http-client";

// Create a new organisation (Admin only)
export const createOrganisation = function (data) {
  return GetApiData("/organisation/register", "POST", data, false);
};

// Get all organisations (Admin only)
export const getAllOrganisations = function (params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.active !== undefined) queryParams.append("active", params.active);

  const query = queryParams.toString();
  return GetApiData(
    `/organisations${query ? `?${query}` : ""}`,
    "GET",
    null,
    true,
  );
};

// Update organisation details (Admin only)
export const updateOrganisation = function (orgId, data) {
  return GetApiData(`/organisation/${orgId}`, "GET", data, true);
};
//TODO: Add toggle organisation status
// Toggle organisation active status (Admin only)
export const toggleOrganisationStatus = function (orgId, data) {
  // return GetApiData(`/organisation/${orgId}/toggle-status`, "", data, true);
};
