import { apiGet, apiPost, apiPut } from "./index";

/**
 * POST /applications — creator applies to a campaign requirement
 * @param {{ requirementId: string, coverLetter?: string, proposedRate?: number }} data
 */
export async function applyToRequirement(data) {
  return apiPost("/api/applications", data);
}

/**
 * GET /applications/mine — list current creator's applications
 */
export async function listMyApplications() {
  return apiGet("/api/applications/mine");
}

/**
 * GET /applications/requirement/:reqId — brand sees applicants for a requirement
 */
export async function listApplicationsForRequirement(reqId) {
  return apiGet(`/api/applications/requirement/${reqId}`);
}

/**
 * GET /applications/accepted-partners — list brands/creators with accepted relationship
 */
export async function listAcceptedPartners() {
  return apiGet("/api/applications/accepted-partners");
}

/**
 * GET /applications/:id — get single application
 */
export async function getApplication(id) {
  return apiGet(`/api/applications/${id}`);
}

/**
 * PUT /applications/:id/status — brand accepts/rejects
 * @param {string} id
 * @param {'accepted' | 'rejected'} status
 */
export async function updateApplicationStatus(id, status) {
  return apiPut(`/api/applications/${id}/status`, { status });
}

/**
 * PUT /applications/:id/withdraw — creator withdraws
 */
export async function withdrawApplication(id) {
  return apiPut(`/api/applications/${id}/withdraw`, {});
}
