import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/l10n/app_translations.dart';
import 'package:mobile/features/reports/logic/reports_providers.dart';

class CreateReportScreen extends ConsumerStatefulWidget {
  const CreateReportScreen({super.key});

  @override
  ConsumerState<CreateReportScreen> createState() => _CreateReportScreenState();
}

class _CreateReportScreenState extends ConsumerState<CreateReportScreen> {
  final _descriptionController = TextEditingController();
  final _picker = ImagePicker();

  XFile? _selectedImage;
  Position? _currentPosition;
  bool _isLocating = false;
  bool _isUploading = false;
  String? _locationError;
  String _privacyLevel = 'PRIVATE';

  @override
  void initState() {
    super.initState();
    _detectLocation();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 75,
      );
      if (image != null) {
        setState(() {
          _selectedImage = image;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: $e'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    }
  }

  void _showPhotoSourceSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.textMuted.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Upload Evidence Photo',
                style: TextStyle(
                  color: AppColors.textLight,
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Select capture method for geotagged waste evidence',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: AppColors.primary.withOpacity(0.3)),
                ),
                tileColor: AppColors.darkSurface,
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.camera_alt_rounded,
                      color: AppColors.primary, size: 22),
                ),
                title: const Text(
                  'Take Photo with Camera',
                  style: TextStyle(
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                subtitle: const Text(
                  'Capture live waste situation now',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
                trailing: const Icon(Icons.arrow_forward_ios,
                    size: 14, color: AppColors.textMuted),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              const SizedBox(height: 10),
              ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: AppColors.darkBorder),
                ),
                tileColor: AppColors.darkSurface,
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.darkBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.photo_library_rounded,
                      color: AppColors.primary, size: 22),
                ),
                title: const Text(
                  'Choose from Gallery',
                  style: TextStyle(
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                subtitle: const Text(
                  'Upload an existing photo from storage',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
                trailing: const Icon(Icons.arrow_forward_ios,
                    size: 14, color: AppColors.textMuted),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  void _viewSelectedImageFullScreen() {
    if (_selectedImage == null) return;
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(12),
        child: Stack(
          alignment: Alignment.center,
          children: [
            InteractiveViewer(
              clipBehavior: Clip.none,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.file(
                  File(_selectedImage!.path),
                  fit: BoxFit.contain,
                ),
              ),
            ),
            Positioned(
              top: 10,
              right: 10,
              child: CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.7),
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _detectLocation() async {
    setState(() {
      _isLocating = true;
      _locationError = null;
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _locationError = 'Location service disabled on device';
          _isLocating = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _locationError = 'Location permission denied';
            _isLocating = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _locationError = 'Location permissions permanently denied';
          _isLocating = false;
        });
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      setState(() {
        _currentPosition = pos;
        _isLocating = false;
      });
    } catch (e) {
      setState(() {
        _locationError = 'Could not acquire GPS: $e';
        _isLocating = false;
      });
    }
  }

  Future<void> _handleSubmit() async {
    final lang = ref.read(languageProvider);

    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppTranslations.tr('photoRequired', lang)),
          backgroundColor: AppColors.statusRejected,
        ),
      );
      return;
    }

    setState(() {
      _isUploading = true;
    });

    final imageBytes = await _selectedImage!.readAsBytes();
    final imageFileName = _selectedImage!.name;

    final success = await ref.read(createReportProvider.notifier).submit(
          description: _descriptionController.text.trim(),
          latitude: _currentPosition?.latitude.toString() ?? '6.5244',
          longitude: _currentPosition?.longitude.toString() ?? '3.3792',
          locationAccuracy: _currentPosition?.accuracy.toStringAsFixed(1) ?? '10.0',
          privacyLevel: _privacyLevel,
          imagePath: _selectedImage!.path,
          imageBytes: imageBytes,
          imageFileName: imageFileName,
          capturedAt: DateTime.now(),
        );

    if (mounted) {
      setState(() {
        _isUploading = false;
      });
    }

    if (success && mounted) {
      final created = ref.read(createReportProvider).createdCase;
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          backgroundColor: AppColors.darkCard,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.primary),
          ),
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: AppColors.primary, size: 28),
              SizedBox(width: 10),
              Text(
                'Report Logged!',
                style: TextStyle(
                  color: AppColors.textLight,
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppTranslations.tr('reportSuccess', lang),
                style: const TextStyle(color: AppColors.textMuted, fontSize: 14),
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.darkSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.darkBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'TRACKING CASE NUMBER',
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      created?.caseNumber ?? 'LAG-XXXXX',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                minimumSize: const Size(double.infinity, 44),
              ),
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pop(context, true); // Close screen with refresh flag
              },
              child: const Text('Back to Home'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = ref.watch(languageProvider);
    final reportState = ref.watch(createReportProvider);

    return Scaffold(
      backgroundColor: AppColors.darkBg,
      appBar: AppBar(
        title: Text(AppTranslations.tr('reportWaste', lang)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Photo Picker Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.camera_alt_outlined,
                          size: 16, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text(
                        AppTranslations.tr('takePhoto', lang),
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        '*',
                        style: TextStyle(
                          color: AppColors.statusRejected,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.statusRejected.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                          color: AppColors.statusRejected.withOpacity(0.3)),
                    ),
                    child: const Text(
                      'REQUIRED',
                      style: TextStyle(
                        color: AppColors.statusRejected,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (_selectedImage != null) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: _viewSelectedImageFullScreen,
                        child: Image.file(
                          File(_selectedImage!.path),
                          width: double.infinity,
                          height: 220,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 10,
                        left: 10,
                        right: 10,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.75),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: AppColors.statusResolved
                                        .withOpacity(0.5)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Icon(Icons.check_circle,
                                      size: 14,
                                      color: AppColors.statusResolved),
                                  SizedBox(width: 5),
                                  Text(
                                    'Photo Ready',
                                    style: TextStyle(
                                      color: AppColors.textLight,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                InkWell(
                                  onTap: () => _showPhotoSourceSheet(context),
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.75),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                          color: AppColors.primary
                                              .withOpacity(0.5)),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: const [
                                        Icon(Icons.cached,
                                            size: 14, color: AppColors.primary),
                                        SizedBox(width: 4),
                                        Text(
                                          'Change',
                                          style: TextStyle(
                                            color: AppColors.textLight,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                CircleAvatar(
                                  radius: 16,
                                  backgroundColor:
                                      Colors.black.withOpacity(0.75),
                                  child: IconButton(
                                    padding: EdgeInsets.zero,
                                    icon: const Icon(Icons.close,
                                        color: Colors.white, size: 16),
                                    onPressed: () {
                                      setState(() {
                                        _selectedImage = null;
                                      });
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Positioned(
                        bottom: 8,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(Icons.zoom_in,
                                  size: 12, color: Colors.white70),
                              SizedBox(width: 4),
                              Text('Tap to inspect',
                                  style: TextStyle(
                                      color: Colors.white70, fontSize: 10)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _showPhotoSourceSheet(context),
                    borderRadius: BorderRadius.circular(18),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          vertical: 22, horizontal: 16),
                      decoration: BoxDecoration(
                        color: AppColors.darkCard,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.4),
                          width: 1.5,
                        ),
                      ),
                      child: Stack(
                        children: [
                          // Viewfinder corner marks
                          Positioned(
                            top: 0,
                            left: 0,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: const BoxDecoration(
                                border: Border(
                                  top: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                  left: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            top: 0,
                            right: 0,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: const BoxDecoration(
                                border: Border(
                                  top: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                  right: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            left: 0,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: const BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                  left: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 16,
                              height: 16,
                              decoration: const BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                  right: BorderSide(
                                      color: AppColors.primary, width: 2.5),
                                ),
                              ),
                            ),
                          ),

                          // Center picker options
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Container(
                                width: 56,
                                height: 56,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.15),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color:
                                          AppColors.primary.withOpacity(0.3)),
                                ),
                                child: const Icon(Icons.add_a_photo_outlined,
                                    color: AppColors.primary, size: 28),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                AppTranslations.tr('captureEvidence', lang),
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: AppColors.textLight,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                AppTranslations.tr('takeOrUpload', lang),
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 11),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                      ),
                                      onPressed: () =>
                                          _pickImage(ImageSource.camera),
                                      icon: const Icon(Icons.camera_alt,
                                          size: 16),
                                      label: Text(
                                        AppTranslations.tr('camera', lang),
                                        style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: AppColors.textLight,
                                        backgroundColor: AppColors.darkSurface,
                                        side: const BorderSide(
                                            color: AppColors.darkBorder),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 11),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                      ),
                                      onPressed: () =>
                                          _pickImage(ImageSource.gallery),
                                      icon: const Icon(
                                          Icons.photo_library_outlined,
                                          size: 16,
                                          color: AppColors.primary),
                                      label: Text(
                                        AppTranslations.tr('gallery', lang),
                                        style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),

              // 2. GPS Location Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 16, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text(
                        AppTranslations.tr('location', lang),
                        style: const TextStyle(
                          color: AppColors.textLight,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  if (_isLocating)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    )
                  else
                    TextButton.icon(
                      onPressed: _detectLocation,
                      icon: const Icon(Icons.my_location,
                          size: 15, color: AppColors.primary),
                      label: Text(
                        _currentPosition != null
                            ? 'Refresh GPS'
                            : 'Acquire GPS',
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 12,
                            fontWeight: FontWeight.w700),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.darkSurface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: _currentPosition != null
                        ? AppColors.primary.withOpacity(0.5)
                        : AppColors.darkBorder,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: _currentPosition != null
                            ? AppColors.primary.withOpacity(0.15)
                            : AppColors.darkBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _currentPosition != null
                            ? Icons.location_on
                            : Icons.location_off_outlined,
                        color: _currentPosition != null
                            ? AppColors.primary
                            : AppColors.textMuted,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_currentPosition != null) ...[
                            Text(
                              '${_currentPosition!.latitude.toStringAsFixed(5)}, ${_currentPosition!.longitude.toStringAsFixed(5)}',
                              style: const TextStyle(
                                color: AppColors.textLight,
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: AppColors.statusResolved,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  'High Accuracy (±${_currentPosition!.accuracy.toStringAsFixed(1)}m)',
                                  style: const TextStyle(
                                    color: AppColors.statusResolved,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ] else if (_locationError != null) ...[
                            Text(
                              _locationError!,
                              style: const TextStyle(
                                color: AppColors.statusRejected,
                                fontSize: 12,
                              ),
                            ),
                          ] else ...[
                            const Text(
                              'Acquiring GPS location...',
                              style: TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 3. Description Section
              Row(
                children: [
                  const Icon(Icons.notes_rounded,
                      size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    AppTranslations.tr('description', lang),
                    style: const TextStyle(
                      color: AppColors.textLight,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '(${AppTranslations.tr('optional', lang)})',
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                style: const TextStyle(color: AppColors.textLight),
                decoration: InputDecoration(
                  hintText: AppTranslations.tr('descriptionHint', lang),
                ),
              ),
              const SizedBox(height: 24),

              // 4. Privacy Level Section
              Row(
                children: [
                  const Icon(Icons.shield_outlined,
                      size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    AppTranslations.tr('privacyLevel', lang),
                    style: const TextStyle(
                      color: AppColors.textLight,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _privacyLevel = 'PRIVATE';
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: _privacyLevel == 'PRIVATE'
                              ? AppColors.primary.withOpacity(0.12)
                              : AppColors.darkSurface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _privacyLevel == 'PRIVATE'
                                ? AppColors.primary
                                : AppColors.darkBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.visibility_off_outlined,
                              size: 18,
                              color: _privacyLevel == 'PRIVATE'
                                  ? AppColors.primary
                                  : AppColors.textMuted,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Private (Anonymous)',
                                style: TextStyle(
                                  color: _privacyLevel == 'PRIVATE'
                                      ? AppColors.primary
                                      : AppColors.textMuted,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _privacyLevel = 'IDENTIFIED';
                        });
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: _privacyLevel == 'IDENTIFIED'
                              ? AppColors.primary.withOpacity(0.12)
                              : AppColors.darkSurface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _privacyLevel == 'IDENTIFIED'
                                ? AppColors.primary
                                : AppColors.darkBorder,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.person_outline,
                              size: 18,
                              color: _privacyLevel == 'IDENTIFIED'
                                  ? AppColors.primary
                                  : AppColors.textMuted,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Identified',
                                style: TextStyle(
                                  color: _privacyLevel == 'IDENTIFIED'
                                      ? AppColors.primary
                                      : AppColors.textMuted,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Error banner
              if (reportState.error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.statusRejected.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.statusRejected.withOpacity(0.4),
                    ),
                  ),
                  child: Text(
                    reportState.error!,
                    style: const TextStyle(
                      color: AppColors.statusRejected,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Submit Button
              ElevatedButton(
                onPressed: (_isUploading || reportState.isSubmitting)
                    ? null
                    : _handleSubmit,
                child: (_isUploading || reportState.isSubmitting)
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(_isUploading
                              ? 'Uploading photo...'
                              : AppTranslations.tr('submitting', lang)),
                        ],
                      )
                    : Text(AppTranslations.tr('submitReport', lang)),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}
