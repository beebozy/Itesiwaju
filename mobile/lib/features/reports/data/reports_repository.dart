import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import 'report_model.dart';

class ReportsRepository {
  final ApiClient _client;

  ReportsRepository(this._client);

  Future<List<WasteCaseModel>> getMyReports() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.reports);
      final list = (response.data['data'] as List<dynamic>)
          .map((item) => WasteCaseModel.fromJson(item as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Failed to load reports';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

  Future<ReportDetailModel> getReportById(String id) async {
    try {
      final response = await _client.dio.get(ApiEndpoints.reportDetail(id));
      final data = response.data['data'] as Map<String, dynamic>;
      return ReportDetailModel.fromJson(data);
    } on DioException catch (e) {
      throw e.error?.toString() ?? 'Failed to load report details';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

  Future<WasteCaseModel> createReport({
    String? description,
    String? latitude,
    String? longitude,
    String? locationAccuracy,
    String privacyLevel = 'PRIVATE',
    String? imagePath,
    String? imageUrl,
    DateTime? capturedAt,
  }) async {
    try {
      dynamic requestData;

      if (imagePath != null && imagePath.isNotEmpty) {
        final fileName = imagePath.split('/').last;
        requestData = FormData.fromMap({
          'photo': await MultipartFile.fromFile(
            imagePath,
            filename: fileName,
          ),
          if (description != null && description.isNotEmpty)
            'description': description,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (locationAccuracy != null) 'locationAccuracy': locationAccuracy,
          'privacyLevel': privacyLevel,
          if (imageUrl != null) 'imageUrl': imageUrl,
          if (capturedAt != null) 'capturedAt': capturedAt.toIso8601String(),
        });
      } else {
        requestData = {
          if (description != null && description.isNotEmpty)
            'description': description,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (locationAccuracy != null) 'locationAccuracy': locationAccuracy,
          'privacyLevel': privacyLevel,
          if (imageUrl != null) 'imageUrl': imageUrl,
          'capturedAt': (capturedAt ?? DateTime.now()).toIso8601String(),
        };
      }

      final response = await _client.dio.post(
        ApiEndpoints.reports,
        data: requestData,
      );

      final data = response.data['data'];
      final wasteCase =
          WasteCaseModel.fromJson(data['wasteCase'] as Map<String, dynamic>);
      return wasteCase;
    } on DioException catch (e) {
      if (e.response?.data != null && e.response?.data is Map) {
        final err = e.response?.data['error'];
        if (err is Map) {
          final msg = err['message'] ?? err['code'];
          final details = err['details'];
          if (details != null && details is String) {
            throw '$msg ($details)';
          }
          if (msg != null) throw msg.toString();
        }
      }
      throw e.error?.toString() ?? e.message ?? 'Failed to submit report';
    } catch (e) {
      throw e.toString();
    }
  }
}
