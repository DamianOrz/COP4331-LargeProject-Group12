import 'api_client.dart';
import 'auth_session.dart';

// The login endpoint expects a field called `login`, not `email`,
// and it returns `accessToken` rather than `jwtToken`.
Future<void> login(String email, String password) async {
  final data = await postApi(
    'login',
    {'login': email, 'password': password},
    requiresAuth: false,
  );

  final token = data['accessToken'];
  if (token is! String || token.isEmpty) {
    throw ApiError('Login failed: no token returned.', 500);
  }

  await AuthSession.instance.setToken(token);
}

Future<void> register({
  required String firstName,
  required String lastName,
  required String email,
  required String password,
}) async {
  await postApi(
    'register',
    {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': password,
    },
    requiresAuth: false,
  );
}

Future<void> logout() => AuthSession.instance.clear();
