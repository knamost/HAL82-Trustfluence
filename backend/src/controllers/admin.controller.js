/**
 * @file admin.controller.js
 * @description Handles admin-only HTTP endpoints.
 */

import * as adminService from '../services/admin.service.js';

/** GET /admin/stats — platform-wide metrics */
export async function stats(req, res) {
  const data = await adminService.getDashboardStats();
  res.json(data);
}

/** GET /admin/users — list all users (filterable) */
export async function listUsers(req, res) {
  const data = await adminService.listUsers(req.query);
  res.json(data);
}

/** DELETE /admin/users/:id — remove a user */
export async function deleteUser(req, res) {
  const data = await adminService.deleteUser(req.params.id);
  res.json(data);
}
