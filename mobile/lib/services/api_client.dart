import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_session.dart';

// Where the backend lives.
// Local:    http://localhost:5000/api
// Deployed: pass --dart-define=API_BASE_URL=http://<host>/api
const String kApiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:5000/api',
);

// Throw if  API returns failure
class ApiError implements Exception {
  final String message;
  final int status;
  ApiError(this.message, this.status);

  bool get isAuthError => status == 401;

  @override
  String toString() => message;
}

// Every endpoint is a POST that takes JSON and returns JSON,
// so one function handles all of them.
Future<Map<String, dynamic>> postApi(
  String path,
  Map<String, dynamic> payload, {
  bool requiresAuth = true,
}) async {
  final session = AuthSession.instance;

  // The backend reads the token from the body as `jwtToken`
  // rather than from an Authorization header.
  final body = <String, dynamic>{
    ...payload,
    if (requiresAuth) 'jwtToken': session.token,
  };

  final http.Response response;
  try {
    response = await http.post(
      Uri.parse('$kApiBaseUrl/$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
  } catch (_) {
    throw ApiError('Could not reach the server.', 0);
  }

  Map<String, dynamic> data;
  try {
    data = jsonDecode(response.body) as Map<String, dynamic>;
  } catch (_) {
    data = {};
  }

  //  refreshed token comes back on authenticated calls + stored
  final refreshed = data['jwtToken'];
  if (refreshed is String && refreshed.isNotEmpty) {
    await session.setToken(refreshed);
  }

  
  final error = data['error'];
  if (error is String && error.isNotEmpty) {
    final err = ApiError(error, response.statusCode);
    if (requiresAuth && err.isAuthError) await session.clear();
    throw err;
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw ApiError('Request failed (${response.statusCode}).', response.statusCode);
  }

  return data;
}
