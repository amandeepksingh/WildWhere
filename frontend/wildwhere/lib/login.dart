import 'package:flutter/material.dart';
import 'package:wildwhere/google_signin.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          //sets the background image
          decoration: BoxDecoration(
              image: const DecorationImage(
                image: AssetImage("assets/images/backgroundtransparent.png"),
                fit: BoxFit.cover,
              ),
              color: Theme.of(context).brightness == Brightness.dark
                  ? Color.fromARGB(160, 255, 255, 255)
                  : Color.fromARGB(237, 255, 255, 255)),
        ),
        const Center(
          //aligns the sign in buttons
          child: IntrinsicWidth(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: 80),
                GoogleSignInButton(),
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
}

  /*
  void signInWithFB() async {
    try {
      FacebookAuthProvider _facebookAuthProvider = FacebookAuthProvider();
      _auth.signInWithProvider(_facebookAuthProvider);
    } catch (error) {
      print(error);
    }
  }

  void signInWithApple() async {
    try {
      AppleAuthProvider _appleAuthProvider = AppleAuthProvider();
      _auth.signInWithProvider(_appleAuthProvider);
    } catch (error) {
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
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
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
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          foregroundColor: const Color.fromARGB(255, 0, 0, 0),
          elevation: 5),
    );
  }
  */