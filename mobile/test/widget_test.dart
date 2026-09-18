import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('ItesiwajuApp smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(
      const ProviderScope(
        child: ItesiwajuApp(),
      ),
    );
    expect(find.byType(ItesiwajuApp), findsOneWidget);
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}
