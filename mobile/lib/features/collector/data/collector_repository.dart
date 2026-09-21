import 'dart:io';
import 'package:dio/dio.dart';
import '../../../../core/constants/api_endpoints.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/services/image_upload_service.dart';
import '../../reports/data/report_model.dart';

class CollectorRepository {
  final ApiClient _client;

  CollectorRepository(this._client);

  /// Fetches cases assigned to this collector or currently in the clearing queue.
  Future<List<WasteCaseModel>> getAssignedCases() async {
    try {
      final response = await _client.dio.get(ApiEndpoints.reports);
      final list = (response.data['data'] as List<dynamic>)
          .map((item) => WasteCaseModel.fromJson(item as Map<String, dynamic>))
          .toList();
      return list;
    } on DioException catch (e) {
      throw e.error?.toString() ?? e.message ?? 'Failed to load assigned cases';
    } catch (e) {
      throw e.toString();
    }
  }

  /// Collector accepts an assigned task (POST /api/v1/assignments/:assignmentId/accept).
  Future<void> acceptAssignment(String assignmentId) async {
    try {
      await _client.dio.post(ApiEndpoints.acceptAssignment(assignmentId));
    } on DioException catch (e) {
      if (e.response?.data != null && e.response?.data is Map) {
        final err = e.response?.data['error'];
        if (err is Map && err['message'] != null) {
          throw err['message'];
        }
      }
      throw e.error?.toString() ?? e.message ?? 'Failed to accept assignment';
    } catch (e) {
      throw e.toString();
    }
  }

  /// Updates status of a case (e.g., to IN_PROGRESS or RESOLVED).
  Future<void> updateCaseStatus(String caseId, String status) async {
    try {
      await _client.dio.patch(
        ApiEndpoints.updateCaseStatus(caseId),
        data: {'status': status},
      );
    } on DioException catch (e) {
      if (e.response?.data != null && e.response?.data is Map) {
        final err = e.response?.data['error'];
        if (err is Map && err['message'] != null) {
          throw err['message'];
        }
      }
      throw e.error?.toString() ?? e.message ?? 'Failed to update case status';
    } catch (e) {
      throw e.toString();
    }
  }

  /// Submits the mandatory After-cleanup photo proof and transitions case to RESOLVED.
  Future<void> submitResolutionProof({
    required String caseId,
    required File resolutionPhoto,
    String? note,
  }) async {
    try {
      // 1. Upload resolution proof photo to Cloudinary
      final secureUrl = await ImageUploadService.uploadImage(resolutionPhoto);
      // ignore: avoid_print
      print('Proof of resolution photo uploaded: $secureUrl');

      // 2. Mark case as RESOLVED in the backend
      await updateCaseStatus(caseId, 'RESOLVED');
    } catch (e) {
      throw 'Failed to submit cleanup proof: $e';
    }
  }
}
