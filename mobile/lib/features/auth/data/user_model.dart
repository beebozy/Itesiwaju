class UserModel {
  final String id;
  final String fullName;
  final String phone;
  final String email;
  final String role;
  final String preferredLanguage;
  final bool isActive;

  UserModel({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.role,
    required this.preferredLanguage,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'CITIZEN',
      preferredLanguage: json['preferredLanguage'] as String? ?? 'en',
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'role': role,
      'preferredLanguage': preferredLanguage,
      'isActive': isActive,
    };
  }
}
