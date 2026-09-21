import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../auth/logic/auth_provider.dart';
import '../../auth/presentation/login_screen.dart';
import '../../reports/data/report_model.dart';
import '../../reports/presentation/reports_feed_screen.dart';
import '../../reports/presentation/widgets/case_status_chip.dart';
import '../logic/collector_providers.dart';
import 'resolution_upload_dialog.dart';

class CollectorDashboardScreen extends ConsumerStatefulWidget {
  const CollectorDashboardScreen({super.key});

  @override
  ConsumerState<CollectorDashboardScreen> createState() =>
      _CollectorDashboardScreenState();
}

class _CollectorDashboardScreenState
    extends ConsumerState<CollectorDashboardScreen> {
  String _selectedFilter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(collectorProvider);

    List<WasteCaseModel> filteredTasks = state.tasks;
    if (_selectedFilter == 'ASSIGNED') {
      filteredTasks =
          state.tasks.where((t) => t.status == 'ASSIGNED').toList();
    } else if (_selectedFilter == 'ACTIVE') {
      filteredTasks = state.tasks
          .where((t) => t.status == 'ACCEPTED' || t.status == 'IN_PROGRESS')
          .toList();
    } else if (_selectedFilter == 'RESOLVED') {
      filteredTasks =
          state.tasks.where((t) => t.status == 'RESOLVED').toList();
    }

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      appBar: AppBar(
        backgroundColor: AppColors.darkCard,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.local_shipping_outlined,
                color: AppColors.primary,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Collector Field Console',
                  style: TextStyle(
                    color: AppColors.textLight,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'PSP Operator Dispatch & Proof-of-Work',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Citizen Feed',
            icon: const Icon(Icons.public, color: AppColors.textMuted),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ReportsFeedScreen()),
              );
            },
          ),
          IconButton(
            tooltip: 'Refresh',
            icon: const Icon(Icons.refresh, color: AppColors.textMuted),
            onPressed: () =>
                ref.read(collectorProvider.notifier).fetchTasks(),
          ),
          IconButton(
            tooltip: 'Sign Out',
            icon: const Icon(Icons.logout, color: AppColors.textMuted),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.darkCard.withOpacity(0.5),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('ALL', 'All Tasks (${state.tasks.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'ASSIGNED',
                    'Awaiting Accept (${state.tasks.where((t) => t.status == 'ASSIGNED').length})',
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'ACTIVE',
                    'In Progress (${state.tasks.where((t) => t.status == 'ACCEPTED' || t.status == 'IN_PROGRESS').length})',
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'RESOLVED',
                    'Completed (${state.tasks.where((t) => t.status == 'RESOLVED').length})',
                  ),
                ],
              ),
            ),
          ),

          // Task List
          Expanded(
            child: state.isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  )
                : filteredTasks.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.assignment_turned_in_outlined,
                              size: 56,
                              color: AppColors.textMuted.withOpacity(0.5),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'No assigned jobs in this category',
                              style: TextStyle(
                                color: AppColors.textLight,
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Pull down to refresh dispatch feed',
                              style: TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: AppColors.primary,
                        backgroundColor: AppColors.darkCard,
                        onRefresh: () =>
                            ref.read(collectorProvider.notifier).fetchTasks(),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredTasks.length,
                          itemBuilder: (context, index) {
                            final task = filteredTasks[index];
                            return _buildTaskCard(task);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String filterKey, String label) {
    final isSelected = _selectedFilter == filterKey;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = filterKey;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : AppColors.darkBg.withOpacity(0.7),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.darkBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textMuted,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildTaskCard(WasteCaseModel task) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.darkCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.darkBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Case # and Status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.receipt_long_outlined,
                      size: 16,
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      task.caseNumber,
                      style: const TextStyle(
                        color: AppColors.textLight,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                CaseStatusChip(status: task.status),
              ],
            ),
            const SizedBox(height: 12),

            // Location
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 16,
                  color: AppColors.textMuted,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    (task.latitude != null && task.longitude != null)
                        ? 'Lat: ${task.latitude}, Lon: ${task.longitude}'
                        : 'Lagos Municipal Ward',
                    style: const TextStyle(
                      color: AppColors.textLight,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),

            if (task.description != null && task.description!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                '"${task.description}"',
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            const SizedBox(height: 14),
            const Divider(color: AppColors.darkBorder, height: 1),
            const SizedBox(height: 12),

            // Action Buttons based on status
            _buildActionButtons(task),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(WasteCaseModel task) {
    final status = task.status.toUpperCase();

    if (status == 'ASSIGNED') {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () async {
            await ref.read(collectorProvider.notifier).acceptAssignment(
                  caseId: task.id,
                  assignmentId: task.id,
                );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          icon: const Icon(Icons.check_circle_outline, size: 18),
          label: const Text(
            'Accept Assignment',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
      );
    }

    if (status == 'ACCEPTED') {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () async {
            await ref
                .read(collectorProvider.notifier)
                .startCleanup(task.id);
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accent,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          icon: const Icon(Icons.directions_run, size: 18),
          label: const Text(
            'Arrived & Start Clearing',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
      );
    }

    if (status == 'IN_PROGRESS') {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () {
            showDialog(
              context: context,
              builder: (_) => ResolutionUploadDialog(
                caseId: task.id,
                caseNumber: task.caseNumber,
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          icon: const Icon(Icons.camera_alt, size: 18),
          label: const Text(
            'Upload "After" Photo & Resolve',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
      );
    }

    // RESOLVED or CLOSED
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.statusResolved.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: AppColors.statusResolved.withOpacity(0.3),
        ),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.verified, color: AppColors.statusResolved, size: 16),
          SizedBox(width: 6),
          Text(
            'Proof Verified — Case Completed',
            style: TextStyle(
              color: AppColors.statusResolved,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
