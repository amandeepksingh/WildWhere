import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class UserController {
  static User? user = FirebaseAuth.instance.currentUser;

  static void init() {
    FirebaseAuth.instance.authStateChanges().listen((User? currentUser) {
      user = currentUser;
    });
  }

  static Future<User?> loginWithGoogle() async {
    final googleAccount = await GoogleSignIn().signIn();

    final googleAuth = await googleAccount?.authentication;

    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth?.accessToken,
      idToken: googleAuth?.idToken,
    );

    final userCredential = await FirebaseAuth.instance.signInWithCredential(
      credential,
    );
    return userCredential.user;
  }

  static Future<User?> loginWithApple() async {

    // Request credentials from Apple Sign In
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );

    // Create Firebase credential using Apple Sign In credentials
    final OAuthProvider oAuthProvider = OAuthProvider('apple.com');
    final AuthCredential authCredential = oAuthProvider.credential(
      idToken: credential.identityToken,
      accessToken: credential.authorizationCode,
    );

    // Sign in to Firebase using Apple credentials
    final UserCredential userCredential =
      await FirebaseAuth.instance.signInWithCredential(authCredential);

    // Return the authenticated user
    return userCredential.user;
  }
}
