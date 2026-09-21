import 'package:flutter/material.dart';
import 'package:mobile/core/constants/app_colors.dart';

class CaseStatusChip extends StatelessWidget {
  final String status;

  const CaseStatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label = status.replaceAll('_', ' ');

    switch (status.toUpperCase()) {
      case 'REPORTED':
        bg = AppColors.statusReported.withOpacity(0.15);
        fg = AppColors.statusReported;
        break;
      case 'UNDER_REVIEW':
        bg = AppColors.statusUnderReview.withOpacity(0.15);
        fg = AppColors.statusUnderReview;
        break;
      case 'VERIFIED':
        bg = AppColors.statusVerified.withOpacity(0.15);
        fg = AppColors.statusVerified;
        break;
      case 'ASSIGNED':
        bg = AppColors.statusAssigned.withOpacity(0.15);
        fg = AppColors.statusAssigned;
        break;
      case 'IN_PROGRESS':
      case 'ACCEPTED':
        bg = AppColors.statusInProgress.withOpacity(0.15);
        fg = AppColors.statusInProgress;
        break;
      case 'RESOLVED':
        bg = AppColors.statusResolved.withOpacity(0.15);
        fg = AppColors.statusResolved;
        break;
      case 'CLOSED':
        bg = AppColors.statusClosed.withOpacity(0.15);
        fg = AppColors.statusClosed;
        break;
      case 'REJECTED':
      case 'DUPLICATE':
        bg = AppColors.statusRejected.withOpacity(0.15);
        fg = AppColors.statusRejected;
        break;
      default:
        bg = Colors.grey.withOpacity(0.15);
        fg = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: fg.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: fg,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
