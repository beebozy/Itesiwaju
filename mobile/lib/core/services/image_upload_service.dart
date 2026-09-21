import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_endpoints.dart';

class ImageUploadService {
  static final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );

  /// Uploads a local image file to Cloudinary and returns a permanent
  /// HTTPS URL (`secure_url`) for the incident report in the backend.
  static Future<String> uploadImage(File imageFile) async {
    try {
      final fileName = imageFile.path.split('/').last;

      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: fileName,
        ),
        'upload_preset': ApiEndpoints.cloudinaryUploadPreset,
        'folder': 'itesiwaju_reports',
      });

      debugPrint('📤 [Cloudinary] Uploading image ($fileName) to ${ApiEndpoints.cloudinaryCloudName}...');

      final response = await _dio.post(
        ApiEndpoints.cloudinaryUploadUrl,
        data: formData,
      );

      debugPrint('📥 [Cloudinary] Status: ${response.statusCode}');
      debugPrint('📥 [Cloudinary] Response: ${response.data}');

      if (response.statusCode == 200 && response.data != null) {
        final secureUrl = response.data['secure_url'] as String;
        debugPrint('✅ [Cloudinary] Upload successful! URL: $secureUrl');
        return secureUrl;
      } else {
        throw 'Cloudinary upload failed with status ${response.statusCode}';
      }
    } on DioException catch (e) {
      debugPrint('⚠️ [Cloudinary] DioException: ${e.message}');
      if (e.response != null) {
        debugPrint('⚠️ [Cloudinary] Error response data: ${e.response?.data}');
        final data = e.response?.data;
        if (data is Map && data['error'] != null) {
          final errorMsg = data['error']['message'] ?? '';
          if (errorMsg.toString().contains('unsigned')) {
            throw 'Cloudinary: Preset "${ApiEndpoints.cloudinaryUploadPreset}" must be set to "Unsigned" in Cloudinary Console (Settings > Upload > Upload Presets).';
          }
          throw 'Cloudinary: $errorMsg';
        }
      }
      rethrow;
    } catch (e) {
      debugPrint('⚠️ [Cloudinary] Image upload error: $e');
      rethrow;
    }
  }
}
