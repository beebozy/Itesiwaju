import 'dart:typed_data';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/logic/auth_provider.dart';
import '../data/report_model.dart';
import '../data/reports_repository.dart';

final reportsRepositoryProvider = Provider<ReportsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return ReportsRepository(client);
});

final myReportsProvider = FutureProvider<List<WasteCaseModel>>((ref) async {
  final repo = ref.watch(reportsRepositoryProvider);
  return repo.getMyReports();
});

final reportsFeedProvider = myReportsProvider;

final reportDetailProvider =
    FutureProvider.family<ReportDetailModel, String>((ref, id) async {
  final repo = ref.watch(reportsRepositoryProvider);
  return repo.getReportById(id);
});

class CreateReportState {
  final bool isSubmitting;
  final String? error;
  final WasteCaseModel? createdCase;

  const CreateReportState({
    this.isSubmitting = false,
    this.error,
    this.createdCase,
  });

  CreateReportState copyWith({
    bool? isSubmitting,
    String? error,
    WasteCaseModel? createdCase,
  }) {
    return CreateReportState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: error,
      createdCase: createdCase ?? this.createdCase,
    );
  }
}

class CreateReportNotifier extends StateNotifier<CreateReportState> {
  final ReportsRepository _repo;

  CreateReportNotifier(this._repo) : super(const CreateReportState());

  Future<bool> submit({
    String? description,
    String? latitude,
    String? longitude,
    String? locationAccuracy,
    String privacyLevel = 'PRIVATE',
    String? imagePath,
    Uint8List? imageBytes,
    String? imageFileName,
    String? imageUrl,
    DateTime? capturedAt,
  }) async {
    state = state.copyWith(isSubmitting: true, error: null);
    try {
      final wasteCase = await _repo.createReport(
        description: description,
        latitude: latitude,
        longitude: longitude,
        locationAccuracy: locationAccuracy,
        privacyLevel: privacyLevel,
        imagePath: imagePath,
        imageBytes: imageBytes,
        imageFileName: imageFileName,
        imageUrl: imageUrl,
        capturedAt: capturedAt,
      );
      state = state.copyWith(isSubmitting: false, createdCase: wasteCase);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  void reset() {
    state = const CreateReportState();
  }
}

final createReportProvider =
    StateNotifierProvider.autoDispose<CreateReportNotifier, CreateReportState>((ref) {
  final repo = ref.watch(reportsRepositoryProvider);
  return CreateReportNotifier(repo);
});
