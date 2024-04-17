import 'package:flutter/material.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:wildwhere/profile.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:wildwhere/user_controller.dart';

class GoogleSignInButton extends StatefulWidget {
  const GoogleSignInButton({super.key});

  @override
  GoogleSignInButtonState createState() => GoogleSignInButtonState();
}

class GoogleSignInButtonState extends State<GoogleSignInButton> {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: handleSignIn,
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
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          foregroundColor: const Color.fromARGB(255, 0, 0, 0),
          elevation: 5),
    );
  }

  void handleSignIn() async {
    try {
      final user = await UserController.loginWithGoogle();
      if (user != null && mounted) {
        var userData = FirebaseAuth.instance.currentUser;
        if (userData?.metadata.creationTime ==
            userData?.metadata.lastSignInTime) {
          Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const Profile()));
        } else {
          Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const MapScreen()));
        }
      }
    } on FirebaseAuthException catch (error) {
      print(error.message);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(
        error.message ?? "Something went wrong",
      )));
    } catch (error) {
      print(error);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(
        error.toString(),
      )));
    }
  }
}
