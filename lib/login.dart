import 'package:flutter/material.dart';
import 'package:wildwhere/mapscreen.dart';
//import 'package:firebase_auth/firebase_auth.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  LoginState createState() => LoginState();
}

class LoginState extends State<Login> {

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Stack(
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
                    const SizedBox(height: 25),
                    appleSignIn(context),
                    const SizedBox(height: 25),
                    fbSignIn(context)
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

//Facebook sign in button
Widget fbSignIn(BuildContext context) {
  return ElevatedButton.icon(
    onPressed: () {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const MapScreen()),
      );
    },
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
    onPressed: () {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const MapScreen()),
      );
    },
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
    onPressed: () {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const MapScreen()),
      );
    },
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        foregroundColor: const Color.fromARGB(255, 0, 0, 0),
        elevation: 5),
  );
}
