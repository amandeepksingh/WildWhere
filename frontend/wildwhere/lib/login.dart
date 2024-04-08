import 'package:flutter/material.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:firebase_auth/firebase_auth.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  User? _user;

  @override
  void initState() {
    super.initState();
    _auth.authStateChanges().listen((event) {
      setState(() {
        _user = event;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _user != null ? MapScreen() : logInScreen(),
    );
  }

  Widget logInScreen() {
    return Stack(
      children: [
        Container(
          //sets the background image
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage("assets/images/image.png"),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Center(
          //aligns the sign in buttons
          child: IntrinsicWidth(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 80),
                googleSignIn(context),
                // const SizedBox(height: 25), //TODO
                // appleSignIn(context),
                // const SizedBox(height: 25), //TODO
                // fbSignIn(context)
              ],
            ),
          ),
        ),
      ],
    );
  }

  void signInWithGoogle() async {
    try {
      GoogleAuthProvider _googleAuthProvider = GoogleAuthProvider();
      _auth.signInWithProvider(_googleAuthProvider);
    } catch(error) {
      print(error);
    }
  }

  void signInWithFB() async {
    try {
      FacebookAuthProvider _facebookAuthProvider = FacebookAuthProvider();
      _auth.signInWithProvider(_facebookAuthProvider);
    } catch(error) {
      print(error);
    }
  }

  void signInWithApple() async {
    try {
      AppleAuthProvider _appleAuthProvider = AppleAuthProvider();
      _auth.signInWithProvider(_appleAuthProvider);
    } catch(error) {
      print(error);
    }
  }

  //Facebook sign in button
  Widget fbSignIn(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () => signInWithFB(),
      icon: Image.asset(
        'assets/images/fb.png',
        width: 30,
        height: 30,
      ),
      label: const SizedBox(
        width: 213,
        height: 30,
        child: Text('Sign in with Facebook', style: TextStyle(fontSize: 20)),
      ),
      style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          foregroundColor: const Color.fromARGB(255, 0, 0, 0),
          elevation: 5),
    );
  }

  //Google sign in button
  Widget googleSignIn(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () => signInWithGoogle(),
      icon: Image.asset(
        'assets/images/google.png',
        width: 30,
        height: 30,
      ),
      label: const SizedBox(
        width: 213,
        height: 30,
        child: Text('Sign in with Google', style: TextStyle(fontSize: 20)),
      ),
      style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          foregroundColor: const Color.fromARGB(255, 0, 0, 0),
          elevation: 5),
    );
  }

  //Apple sign in button
  Widget appleSignIn(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () => signInWithApple(),
      icon: Image.asset(
        'assets/images/apple.png',
        width: 30,
        height: 30,
      ),
      label: const SizedBox(
        width: 213,
        height: 30,
        child: Text('Sign in with Apple', style: TextStyle(fontSize: 20)),
      ),
      style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30)),
          foregroundColor: const Color.fromARGB(255, 0, 0, 0),
          elevation: 5),
    );
  }
}