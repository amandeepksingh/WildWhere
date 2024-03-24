import 'package:flutter/material.dart';

class Login extends StatelessWidget {
  const Login({super.key});

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
                    googleSignIn(),
                    const SizedBox(height: 25),
                    appleSignIn(),
                    const SizedBox(height: 25),
                    fbSignIn()
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
Widget fbSignIn() {
  return ElevatedButton.icon(
    onPressed: () {},
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
Widget googleSignIn() {
  return ElevatedButton.icon(
    onPressed: () {},
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
Widget appleSignIn() {
  return ElevatedButton.icon(
    onPressed: () {},
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
