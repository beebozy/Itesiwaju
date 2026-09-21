import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/token_storage.dart';

class AppTranslations {
  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'appName': 'Itesiwaju',
      'appTagline': 'Digital Waste Management & Accountability',
      'loginTitle': 'Welcome Back',
      'loginSubtitle': 'Sign in to report and track waste issues',
      'email': 'Email Address',
      'password': 'Password',
      'loginBtn': 'Sign In',
      'noAccount': "Don't have an account? Register",
      'alreadyHaveAccount': 'Already have an account? Sign In',
      'registerTitle': 'Create Account',
      'registerSubtitle': 'Join your community in making streets cleaner',
      'fullName': 'Full Name',
      'phone': 'Phone Number',
      'preferredLang': 'Preferred Language',
      'registerBtn': 'Register',
      'myReports': 'My Reports',
      'reportWaste': 'Report Waste',
      'noReportsYet': 'No waste reports filed yet. Tap below to clean up your area!',
      'takePhoto': 'Photo of Waste',
      'photoRequired': 'Please take or select a photo of the waste',
      'location': 'Location (GPS)',
      'detectLocation': 'Capture My GPS Location',
      'locationCaptured': 'Location tagged with GPS',
      'description': 'Description (Optional)',
      'descriptionHint': 'E.g. Drain blocked by plastic bottles near bus stop',
      'privacy': 'Privacy Level',
      'privateReport': 'Private (Anonymous to collectors)',
      'identifiedReport': 'Identified (Show my name)',
      'submitReport': 'Submit Report',
      'submitting': 'Submitting report...',
      'reportSuccess': 'Report Submitted Successfully!',
      'caseNumber': 'Case Number',
      'status': 'Status',
      'timeline': 'Audit Timeline',
      'evidence': 'Evidence Photos',
      'logout': 'Sign Out',
      'selectLanguage': 'Change Language',
    },
    'yo': {
      'appName': 'Itesiwaju',
      'appTagline': 'Ìtọ́jú Ìdọ̀tí àti Ìjábọ̀ fún Ìlọsíwájú',
      'loginTitle': 'Káàbọ̀ Padà',
      'loginSubtitle': 'Wọlé láti fi ìdọ̀tí tó wà ní àdúgbò rẹ hàn',
      'email': 'Àdírẹ́sì Ímeèlì',
      'password': 'Ọ̀rọ̀ Aṣírí',
      'loginBtn': 'Wọlé',
      'noAccount': 'Ṣé o kò tíì ní àkọ́ọ́lẹ̀? Forúkọsílẹ̀',
      'alreadyHaveAccount': 'Ṣé o ti ní àkọ́ọ́lẹ̀? Wọlé',
      'registerTitle': 'Ṣẹ̀dá Àkọ́ọ́lẹ̀ Tuntun',
      'registerSubtitle': 'Darapọ̀ mọ́ àwùjọ láti jẹ́ kí àdúgbò wa mọ́ tónítóní',
      'fullName': 'Orúkọ Lẹ́kùn-únrẹ́rẹ́',
      'phone': 'Nọ́mbà Ètò Ìbánisọ̀rọ̀',
      'preferredLang': 'Èdè Tí O Fẹ́',
      'registerBtn': 'Forúkọsílẹ̀',
      'myReports': 'Àwọn Ìjábọ̀ Mi',
      'reportWaste': 'Ṣàfihàn Ìdọ̀tí',
      'noReportsYet': 'Kò sí ìjábọ̀ ìdọ̀tí kankan báyìí. Tẹ bọ́tìnì láti bẹ̀rẹ̀!',
      'takePhoto': 'Àwòrán Ìdọ̀tí',
      'photoRequired': 'Jọ̀wọ́ ya àwòrán ìdọ̀tí náà',
      'location': 'Ibùdó (GPS)',
      'detectLocation': 'Wá Ibùdó Mi (GPS)',
      'locationCaptured': 'A ti gba ibùdó rẹ',
      'description': 'Àpèjúwe Ìdọ̀tí',
      'descriptionHint': 'Fún àpẹẹrẹ: Ìdọ̀tí dí ojú àgbàrá lẹ́bàá ibùdókọ̀',
      'privacy': 'Ètò Àṣírí',
      'privateReport': 'Pa orúkọ mi mọ́ (Àṣírí)',
      'identifiedReport': 'Fi orúkọ mi hàn',
      'submitReport': 'Fi Ìjábọ̀ Ransẹ́',
      'submitting': 'Ń fi ránṣẹ́ lọ́wọ́...',
      'reportSuccess': 'A Ti Gba Ìjábọ̀ Rẹ!',
      'caseNumber': 'Nọ́mbà Ẹjọ́',
      'status': 'Ipò Ìwé',
      'timeline': 'Ìgbésẹ̀ Ìyípadà',
      'evidence': 'Àwọn Àwòrán Ẹ̀rí',
      'logout': 'Jáde',
      'selectLanguage': 'Yí Èdè Padà',
    },
    'pcm': {
      'appName': 'Itesiwaju',
      'appTagline': 'Digital Waste Management & Accountability',
      'loginTitle': 'Welcome Back',
      'loginSubtitle': 'Sign in make you report dirt and follow up work',
      'email': 'Email Address',
      'password': 'Password',
      'loginBtn': 'Sign In',
      'noAccount': 'You never get account? Register',
      'alreadyHaveAccount': 'You already get account? Sign In',
      'registerTitle': 'Open Account',
      'registerSubtitle': 'Join body make our streets clean and sweet',
      'fullName': 'Full Name',
      'phone': 'Phone Number',
      'preferredLang': 'Language Wey You Like',
      'registerBtn': 'Register',
      'myReports': 'My Reports',
      'reportWaste': 'Report Dirt',
      'noReportsYet': 'You never report any dirt yet. Tap am make we clear am!',
      'takePhoto': 'Snap Dirt Photo',
      'photoRequired': 'Abeg snap or pick photo of the dirt',
      'location': 'Location (GPS)',
      'detectLocation': 'Find My Current GPS',
      'locationCaptured': 'We don get your GPS location',
      'description': 'Explain Wetin Happen (Optional)',
      'descriptionHint': 'E.g. Pure water nylon full gutter near bus stop',
      'privacy': 'Privacy Setting',
      'privateReport': 'Hide My Name (Private)',
      'identifiedReport': 'Show My Name',
      'submitReport': 'Send Report',
      'submitting': 'Dey send am...',
      'reportSuccess': 'Report Don Enter Well!',
      'caseNumber': 'Case Number',
      'status': 'Condition',
      'timeline': 'How Work Dey Go',
      'evidence': 'Proof Photos',
      'logout': 'Sign Out',
      'selectLanguage': 'Change Language',
    }
  };

  static String tr(String key, String lang) {
    return _localizedValues[lang]?[key] ??
           _localizedValues['en']?[key] ??
           key;
  }
}

class LanguageNotifier extends StateNotifier<String> {
  LanguageNotifier() : super('en') {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final lang = await TokenStorage.getLanguage();
    state = lang;
  }

  Future<void> setLanguage(String lang) async {
    await TokenStorage.setLanguage(lang);
    state = lang;
  }
}

final languageProvider = StateNotifierProvider<LanguageNotifier, String>((ref) {
  return LanguageNotifier();
});
