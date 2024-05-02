import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:wildwhere/edit_profile.dart';
import 'package:wildwhere/user.dart' as app_user;
import 'package:wildwhere/user_controller.dart';

class GoogleSignInButton extends StatefulWidget {
  const GoogleSignInButton({super.key});

  @override
  GoogleSignInButtonState createState() => GoogleSignInButtonState();
}

class GoogleSignInButtonState extends State<GoogleSignInButton> {
  //declare variables for possible new user
  String? uid;
  String? email;
  String? username;
  String? bio;
  bool? superUser;
  String? imgLink;
  Database db = Database();
  late SharedPreferences prefs;
  //sets the layout of the screen: background picture and buttons
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
          elevation: 5),
    );
  }

  //handles google signin and creating a new user object/prefs if needed
  void handleSignIn() async {
    try {
      await UserController.loginWithGoogle();
    } catch (e) {
      throw Exception("Error signing in: $e");
    }
    var userData = FirebaseAuth.instance.currentUser;
    http.Response response = await db.getUserByUID(uid: userData!.uid);
    var data = jsonDecode(response.body);
    //check if user exists
    if (data['message'].isEmpty) {
      app_user.User newUser = app_user.User(
        uid: userData.uid,
        email: userData.email,
        username: username,
        bio: bio,
        superUser: superUser,
        imgLink: imgLink,
      );
      db.createUser(newUser);
      createUserPrefs(userData);
      Navigator.pushReplacement(
          context,
          MaterialPageRoute(
              builder: (context) =>
                  EditProfile(prefs: prefs, firstTimeSignin: true)));
      //returning user
    } else {
      db.initializePrefs(userData.uid);
      Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MapScreen()));
    }
  }

  void createUserPrefs(var userData) async {
    prefs = await SharedPreferences.getInstance();
    prefs.setString('uid', userData.uid);
    prefs.setString('email', userData.email);
  }
}
