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
}
