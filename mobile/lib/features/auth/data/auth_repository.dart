import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/token_storage.dart';
import 'user_model.dart';

class AuthRepository {
  final ApiClient _client;

  AuthRepository(this._client);

  Future<UserModel> register({
    required String fullName,
    required String phone,
    required String email,
    required String password,
    required String preferredLanguage,
  }) async {
    try {
      final response = await _client.dio.post(
        ApiEndpoints.register,
        data: {
          'fullName': fullName,
          'phone': phone,
          'email': email,
          'password': password,
          'preferredLanguage': preferredLanguage,
        },
      );

      final data = response.data['data'];
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
      return user;
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Registration failed';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.dio.post(
        ApiEndpoints.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      final data = response.data['data'];
      final token = data['accessToken'] as String;
      final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);

      await TokenStorage.saveSession(
        token: token,
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language: user.preferredLanguage,
      );

      return user;
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Login failed';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

  Future<void> logout() async {
    await TokenStorage.clearSession();
  }
}
