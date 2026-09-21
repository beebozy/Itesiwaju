class ApiEndpoints {
  // Live Vercel Backend
  static const String baseUrl = 'https://backend-6vdv-blue.vercel.app';

  // Auth
  static const String register = '/api/v1/auth/register';
  static const String login = '/api/v1/auth/login';

  // Reports
  static const String reports = '/api/v1/reports';
  static String reportDetail(String id) => '/api/v1/reports/$id';

  // Health
  static const String health = '/health';

  // Cases & Status Transitions
  static String updateCaseStatus(String id) => '/api/v1/cases/$id/status';

  // Assignments
  static String assignCase(String caseId) => '/api/v1/assignments/$caseId/assign';
  static String acceptAssignment(String assignmentId) =>
      '/api/v1/assignments/$assignmentId/accept';

  // Cloudinary Image Hosting
  static const String cloudinaryCloudName = 'jetfuqhx';
  static const String cloudinaryUploadPreset = 'ml_default';
  static const String cloudinaryUploadUrl =
      'https://api.cloudinary.com/v1_1/$cloudinaryCloudName/image/upload';
}
