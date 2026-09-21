class WasteCaseModel {
  final String id;
  final String caseNumber;
  final String source;
  final String status;
  final String? description;
  final String? latitude;
  final String? longitude;
  final String? locationAccuracy;
  final String privacyLevel;
  final DateTime reportedAt;
  final DateTime createdAt;

  WasteCaseModel({
    required this.id,
    required this.caseNumber,
    required this.source,
    required this.status,
    this.description,
    this.latitude,
    this.longitude,
    this.locationAccuracy,
    required this.privacyLevel,
    required this.reportedAt,
    required this.createdAt,
  });

  factory WasteCaseModel.fromJson(Map<String, dynamic> json) {
    return WasteCaseModel(
      id: json['id'] as String? ?? '',
      caseNumber: json['caseNumber'] as String? ?? '',
      source: json['source'] as String? ?? 'MOBILE',
      status: json['status'] as String? ?? 'REPORTED',
      description: json['description'] as String?,
      latitude: json['latitude']?.toString(),
      longitude: json['longitude']?.toString(),
      locationAccuracy: json['locationAccuracy']?.toString(),
      privacyLevel: json['privacyLevel'] as String? ?? 'PRIVATE',
      reportedAt: json['reportedAt'] != null
          ? DateTime.tryParse(json['reportedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  WasteCaseModel copyWith({
    String? id,
    String? caseNumber,
    String? source,
    String? status,
    String? description,
    String? latitude,
    String? longitude,
    String? locationAccuracy,
    String? privacyLevel,
    DateTime? reportedAt,
    DateTime? createdAt,
  }) {
    return WasteCaseModel(
      id: id ?? this.id,
      caseNumber: caseNumber ?? this.caseNumber,
      source: source ?? this.source,
      status: status ?? this.status,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      locationAccuracy: locationAccuracy ?? this.locationAccuracy,
      privacyLevel: privacyLevel ?? this.privacyLevel,
      reportedAt: reportedAt ?? this.reportedAt,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class EvidenceModel {
  final String id;
  final String caseId;
  final String type; // REPORT_PHOTO, BEFORE_PHOTO, AFTER_PHOTO
  final String mediaUrl;
  final DateTime? capturedAt;
  final DateTime createdAt;

  EvidenceModel({
    required this.id,
    required this.caseId,
    required this.type,
    required this.mediaUrl,
    this.capturedAt,
    required this.createdAt,
  });

  factory EvidenceModel.fromJson(Map<String, dynamic> json) {
    return EvidenceModel(
      id: json['id'] as String? ?? '',
      caseId: json['caseId'] as String? ?? '',
      type: json['type'] as String? ?? 'REPORT_PHOTO',
      mediaUrl: json['mediaUrl'] as String? ?? '',
      capturedAt: json['capturedAt'] != null
          ? DateTime.tryParse(json['capturedAt'].toString())
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class CaseEventModel {
  final String id;
  final String caseId;
  final String eventType;
  final String description;
  final DateTime createdAt;

  CaseEventModel({
    required this.id,
    required this.caseId,
    required this.eventType,
    required this.description,
    required this.createdAt,
  });

  factory CaseEventModel.fromJson(Map<String, dynamic> json) {
    return CaseEventModel(
      id: json['id'] as String? ?? '',
      caseId: json['caseId'] as String? ?? '',
      eventType: json['eventType'] as String? ?? 'UNKNOWN',
      description: json['description'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class ReportDetailModel {
  final WasteCaseModel wasteCase;
  final List<EvidenceModel> evidence;
  final List<CaseEventModel> events;

  ReportDetailModel({
    required this.wasteCase,
    required this.evidence,
    required this.events,
  });

  factory ReportDetailModel.fromJson(Map<String, dynamic> json) {
    final caseData = json['wasteCase'] as Map<String, dynamic>;
    final evidenceList = (json['evidence'] as List<dynamic>?)
            ?.map((e) => EvidenceModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    final eventsList = (json['events'] as List<dynamic>?)
            ?.map((e) => CaseEventModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return ReportDetailModel(
      wasteCase: WasteCaseModel.fromJson(caseData),
      evidence: evidenceList,
      events: eventsList,
    );
  }
}
