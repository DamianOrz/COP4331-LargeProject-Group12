import 'package:flutter/foundation.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';


// carries userId, firstName, lastName, and email. no need to store the user separately.
class AuthSession extends ChangeNotifier {
  AuthSession._();
  static final AuthSession instance = AuthSession._();

  static const _tokenKey = 'jwt_token';

  String? _token;
  String? get token => _token;

  bool get isLoggedIn => _token != null && !JwtDecoder.isExpired(_token!);

  Map<String, dynamic> get _claims {
    if (_token == null) return const {};
    try {
      return JwtDecoder.decode(_token!);
    } catch (_) {
      return const {};
    }
  }

  String? get userId => _claims['userId']?.toString();
  String? get firstName => _claims['firstName'] as String?;
  String? get lastName => _claims['lastName'] as String?;
  String? get email => _claims['email'] as String?;

  String get displayName {
    final name = '${firstName ?? ''} ${lastName ?? ''}'.trim();
    return name.isEmpty ? 'Guest' : name;
  }

  // use a previously saved token when the app starts.
  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_tokenKey);

    if (saved != null && !JwtDecoder.isExpired(saved)) {
      _token = saved;
    } else if (saved != null) {
      await prefs.remove(_tokenKey);
    }

    notifyListeners();
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    notifyListeners();
  }

  Future<void> clear() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    notifyListeners();
  }
}
