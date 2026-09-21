import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/constants/app_colors.dart';
import 'package:mobile/core/l10n/app_translations.dart';
import 'package:mobile/core/storage/token_storage.dart';
import 'package:mobile/features/auth/logic/auth_provider.dart';
import 'package:mobile/features/auth/presentation/login_screen.dart';
import 'package:mobile/features/profile/presentation/language_dialog.dart';
import 'package:mobile/features/reports/logic/reports_providers.dart';
import '../../collector/presentation/collector_dashboard_screen.dart';
import 'create_report_screen.dart';
import 'report_detail_screen.dart';
import 'widgets/case_status_chip.dart';

class ReportsFeedScreen extends ConsumerStatefulWidget {
  const ReportsFeedScreen({super.key});

  @override
  ConsumerState<ReportsFeedScreen> createState() => _ReportsFeedScreenState();
}

class _ReportsFeedScreenState extends ConsumerState<ReportsFeedScreen> {
  String _userName = 'Citizen';
  String _userRole = 'CITIZEN';

  @override
  void initState() {
    super.initState();
    _loadUser();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ref.invalidate(myReportsProvider);
      }
    });
  }

  Future<void> _loadUser() async {
    final name = await TokenStorage.getUserName();
    final role = await TokenStorage.getUserRole();
    if (mounted) {
      setState(() {
        if (name != null && name.isNotEmpty) {
          _userName = name.split(' ').first;
        } else {
          _userName = 'Citizen';
        }
        _userRole = role;
      });
    }
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        title: const Text('Sign Out', style: TextStyle(color: AppColors.textLight)),
        content: const Text(
          'Are you sure you want to sign out?',
          style: TextStyle(color: AppColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.statusRejected,
              minimumSize: const Size(80, 36),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      ref.invalidate(myReportsProvider);
      await ref.read(authProvider.notifier).logout();
      ref.invalidate(myReportsProvider);
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  Widget _buildStatPill(String label, String value, {Color color = AppColors.primary}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w800,
              fontSize: 12,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(languageProvider);
    final reportsAsync = ref.watch(myReportsProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/logo.png',
                width: 32,
                height: 32,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'ITESIWAJU',
              style: TextStyle(
                color: AppColors.textLight,
                fontWeight: FontWeight.w800,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
        actions: [
          if (_userRole == 'COLLECTOR' || _userRole == 'PSP_OPERATOR')
            IconButton(
              tooltip: 'Collector Console',
              icon: const Icon(Icons.local_shipping_outlined, color: AppColors.statusAssigned),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CollectorDashboardScreen(),
                  ),
                );
              },
            ),
          IconButton(
            tooltip: 'Change Language',
            icon: const Icon(Icons.language, color: AppColors.primary),
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => const LanguageDialog(),
              );
            },
          ),
          IconButton(
            tooltip: 'Sign Out',
            icon: const Icon(Icons.logout, color: AppColors.textMuted),
            onPressed: _handleLogout,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: AppColors.darkCard,
          onRefresh: () async {
            return ref.refresh(myReportsProvider.future);
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // Hero Welcome Card
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primary.withOpacity(0.18),
                          AppColors.darkCard,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Welcome, $_userName',
                              style: const TextStyle(
                                color: AppColors.textLight,
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                lang.toUpperCase(),
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          AppTranslations.tr('appTagline', lang),
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 13,
                          ),
                        ),
                        reportsAsync.maybeWhen(
                          data: (reports) {
                            if (reports.isEmpty) return const SizedBox.shrink();
                            final resolved = reports
                                .where((r) =>
                                    r.status == 'RESOLVED' ||
                                    r.status == 'CLOSED')
                                .length;
                            final inProgress = reports
                                .where((r) =>
                                    r.status == 'ASSIGNED' ||
                                    r.status == 'IN_PROGRESS' ||
                                    r.status == 'UNDER_REVIEW')
                                .length;
                            return Padding(
                              padding: const EdgeInsets.only(top: 16),
                              child: Row(
                                children: [
                                  _buildStatPill(
                                      'Reports', '${reports.length}'),
                                  const SizedBox(width: 8),
                                  _buildStatPill(
                                      'Active', '$inProgress',
                                      color: AppColors.statusAssigned),
                                  const SizedBox(width: 8),
                                  _buildStatPill(
                                      'Cleaned', '$resolved',
                                      color: AppColors.statusResolved),
                                ],
                              ),
                            );
                          },
                          orElse: () => const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Title: My Reports
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        AppTranslations.tr('myReports', lang),
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      reportsAsync.when(
                        data: (reports) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.darkSurface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${reports.length} total',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        loading: () => const SizedBox.shrink(),
                        error: (err, stack) => const SizedBox.shrink(),
                      ),
                    ],
                  ),
                ),
              ),

              // Reports list or states
              reportsAsync.when(
                data: (reports) {
                  if (reports.isEmpty) {
                    return SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 72,
                                height: 72,
                                decoration: BoxDecoration(
                                  color: AppColors.darkSurface,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Icon(Icons.recycling_outlined,
                                    size: 36, color: AppColors.primary),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                AppTranslations.tr('noReportsYet', lang),
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 14,
                                  height: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }

                  return SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 80),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = reports[index];
                          final dateStr = DateFormat('MMM dd, yyyy • hh:mm a')
                              .format(item.reportedAt);

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: AppColors.darkCard,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: AppColors.darkBorder),
                            ),
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        ReportDetailScreen(reportId: item.id),
                                  ),
                                );
                              },
                              borderRadius: BorderRadius.circular(18),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          item.caseNumber,
                                          style: const TextStyle(
                                            color: AppColors.textLight,
                                            fontWeight: FontWeight.w800,
                                            fontSize: 15,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                        CaseStatusChip(status: item.status),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (item.imageUrl != null &&
                                            item.imageUrl!.isNotEmpty)
                                          Padding(
                                            padding:
                                                const EdgeInsets.only(right: 12),
                                            child: ClipRRect(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                              child: Image.network(
                                                item.imageUrl!,
                                                width: 64,
                                                height: 64,
                                                fit: BoxFit.cover,
                                                errorBuilder: (_, __, ___) =>
                                                    Container(
                                                  width: 64,
                                                  height: 64,
                                                  decoration: BoxDecoration(
                                                    color: AppColors.darkSurface,
                                                    borderRadius:
                                                        BorderRadius.circular(12),
                                                  ),
                                                  child: const Icon(
                                                    Icons.image_not_supported_outlined,
                                                    size: 22,
                                                    color: AppColors.textMuted,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                (item.description != null &&
                                                        item.description!.isNotEmpty)
                                                    ? item.description!
                                                    : 'Waste incident reported via mobile',
                                                maxLines: 2,
                                                overflow:
                                                    TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: AppColors.textMuted,
                                                  fontSize: 13,
                                                  height: 1.4,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.access_time,
                                              size: 13,
                                              color: AppColors.textMuted,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              dateStr,
                                              style: const TextStyle(
                                                color: AppColors.textMuted,
                                                fontSize: 11,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const Row(
                                          children: [
                                            Text(
                                              'Details',
                                              style: TextStyle(
                                                color: AppColors.primary,
                                                fontSize: 12,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                            Icon(
                                              Icons.chevron_right,
                                              size: 16,
                                              color: AppColors.primary,
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: reports.length,
                      ),
                    ),
                  );
                },
                loading: () => const SliverFillRemaining(
                  child: Center(
                    child: CircularProgressIndicator(
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                ),
                error: (err, _) => SliverFillRemaining(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline,
                              color: AppColors.statusRejected, size: 40),
                          const SizedBox(height: 12),
                          Text(
                            err.toString(),
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(120, 40),
                            ),
                            onPressed: () => ref.refresh(myReportsProvider),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        onPressed: () async {
          final created = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const CreateReportScreen()),
          );
          if (created == true) {
            ref.invalidate(myReportsProvider);
          }
        },
        icon: const Icon(Icons.camera_alt_outlined),
        label: Text(
          AppTranslations.tr('reportWaste', lang),
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
