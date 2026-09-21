import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_endpoints.dart';
import '../storage/token_storage.dart';

class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await TokenStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Print request details in console
          debugPrint('──────────────────────────────────────────────────────────');
          debugPrint('🚀 [API REQUEST] ${options.method} ${options.uri}');
          if (options.headers.containsKey('Authorization')) {
            debugPrint('🔑 Auth: Bearer ${options.headers['Authorization'].toString().substring(0, 15)}...');
          }
          if (options.data != null) {
            debugPrint('📤 Request Body:\n${_formatPayload(options.data)}');
          }
          debugPrint('──────────────────────────────────────────────────────────');

          return handler.next(options);
        },
        onResponse: (response, handler) {
          // Print response details in console
          debugPrint('──────────────────────────────────────────────────────────');
          debugPrint('✅ [API RESPONSE: ${response.statusCode}] ${response.requestOptions.method} ${response.requestOptions.uri}');
          debugPrint('📥 Response Body:\n${_formatPayload(response.data)}');
          debugPrint('──────────────────────────────────────────────────────────');

          return handler.next(response);
        },
        onError: (DioException e, handler) {
          String errorMessage = 'Something went wrong. Please try again.';
          if (e.response?.data is Map) {
            final data = e.response!.data as Map;
            if (data.containsKey('error') && data['error'] is Map) {
              errorMessage = data['error']['message'] ?? errorMessage;
            } else if (data.containsKey('message')) {
              errorMessage = data['message'];
            }
          } else if (e.type == DioExceptionType.connectionTimeout ||
              e.type == DioExceptionType.receiveTimeout) {
            errorMessage = 'Connection timed out. Check your internet connection.';
          } else if (e.type == DioExceptionType.connectionError) {
            errorMessage = 'Cannot reach server. Please check your network.';
          }

          // Print error details in console
          debugPrint('──────────────────────────────────────────────────────────');
          debugPrint('❌ [API ERROR: ${e.response?.statusCode ?? 'NETWORK'}] ${e.requestOptions.method} ${e.requestOptions.uri}');
          if (e.response?.data != null) {
            debugPrint('💥 Error Body:\n${_formatPayload(e.response?.data)}');
          } else {
            debugPrint('💥 Error Message: $errorMessage (${e.type})');
          }
          debugPrint('──────────────────────────────────────────────────────────');

          return handler.reject(
            DioException(
              requestOptions: e.requestOptions,
              response: e.response,
              type: e.type,
              error: errorMessage,
            ),
          );
        },
      ),
    );
  }

  static String _formatPayload(dynamic data) {
    try {
      if (data is Map || data is List) {
        return const JsonEncoder.withIndent('  ').convert(data);
      }
      return data.toString();
    } catch (_) {
      return data.toString();
    }
  }
}
