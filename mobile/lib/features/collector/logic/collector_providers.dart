import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/logic/auth_provider.dart';
import '../../reports/data/report_model.dart';
import '../data/collector_repository.dart';

final collectorRepositoryProvider = Provider<CollectorRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CollectorRepository(client);
});

class CollectorState {
  final bool isLoading;
  final bool isSubmittingProof;
  final List<WasteCaseModel> tasks;
  final String? error;
  final String? successMessage;

  const CollectorState({
    this.isLoading = false,
    this.isSubmittingProof = false,
    this.tasks = const [],
    this.error,
    this.successMessage,
  });

  CollectorState copyWith({
    bool? isLoading,
    bool? isSubmittingProof,
    List<WasteCaseModel>? tasks,
    String? error,
    String? successMessage,
  }) {
    return CollectorState(
      isLoading: isLoading ?? this.isLoading,
      isSubmittingProof: isSubmittingProof ?? this.isSubmittingProof,
      tasks: tasks ?? this.tasks,
      error: error,
      successMessage: successMessage,
    );
  }
}

class CollectorNotifier extends StateNotifier<CollectorState> {
  final CollectorRepository _repo;

  CollectorNotifier(this._repo) : super(const CollectorState()) {
    fetchTasks();
  }

  Future<void> fetchTasks() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _repo.getAssignedCases();
      state = state.copyWith(isLoading: false, tasks: list);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> acceptAssignment({
    required String caseId,
    required String assignmentId,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repo.acceptAssignment(assignmentId);
      // Update local task status to ACCEPTED
      final updated = state.tasks.map((t) {
        return t.id == caseId ? t.copyWith(status: 'ACCEPTED') : t;
      }).toList();
      state = state.copyWith(
        isLoading: false,
        tasks: updated,
        successMessage: 'Assignment accepted! Ready to mobilize.',
      );
      return true;
    } catch (e) {
      // If assignment ID endpoint isn't matched, attempt status update
      try {
        await _repo.updateCaseStatus(caseId, 'ACCEPTED');
        final updated = state.tasks.map((t) {
          return t.id == caseId ? t.copyWith(status: 'ACCEPTED') : t;
        }).toList();
        state = state.copyWith(
          isLoading: false,
          tasks: updated,
          successMessage: 'Assignment accepted! Ready to mobilize.',
        );
        return true;
      } catch (innerErr) {
        state = state.copyWith(isLoading: false, error: e.toString());
        return false;
      }
    }
  }

  Future<bool> startCleanup(String caseId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repo.updateCaseStatus(caseId, 'IN_PROGRESS');
      final updated = state.tasks.map((t) {
        return t.id == caseId ? t.copyWith(status: 'IN_PROGRESS') : t;
      }).toList();
      state = state.copyWith(
        isLoading: false,
        tasks: updated,
        successMessage: 'Clearing team mobilized on site.',
      );
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> submitProofOfResolution({
    required String caseId,
    required File resolutionPhoto,
  }) async {
    state = state.copyWith(isSubmittingProof: true, error: null);
    try {
      await _repo.submitResolutionProof(
        caseId: caseId,
        resolutionPhoto: resolutionPhoto,
      );
      final updated = state.tasks.map((t) {
        return t.id == caseId ? t.copyWith(status: 'RESOLVED') : t;
      }).toList();
      state = state.copyWith(
        isSubmittingProof: false,
        tasks: updated,
        successMessage: 'Cleanup verified! Proof submitted for agency audit.',
      );
      return true;
    } catch (e) {
      state = state.copyWith(isSubmittingProof: false, error: e.toString());
      return false;
    }
  }
}

final collectorProvider =
    StateNotifierProvider<CollectorNotifier, CollectorState>((ref) {
  final repo = ref.watch(collectorRepositoryProvider);
  return CollectorNotifier(repo);
});
