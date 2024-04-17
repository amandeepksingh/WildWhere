import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:wildwhere/edit_profile.dart';
import 'package:wildwhere/user_controller.dart';
import 'package:http/http.dart' as http;
import 'package:wildwhere/database.dart';
import 'package:wildwhere/user.dart' as app_user;

class GoogleSignInButton extends StatefulWidget {
  const GoogleSignInButton({super.key});

  @override
  GoogleSignInButtonState createState() => GoogleSignInButtonState();
}

class GoogleSignInButtonState extends State<GoogleSignInButton> {
  //declare variables for possible new user
  late String uid;
  String? email;
  String? username;
  String? bio;
  bool? superUser;
  String? imgLink;

  //sets the layout of the screen: background picture and buttosn
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

  //handles google signin and creating a new user if needed
  void handleSignIn() async {
    try {
      final user = await UserController.loginWithGoogle();
      if (user != null && mounted) {
        Database db = Database();
        var userData = FirebaseAuth.instance.currentUser;
        http.Response response = await db.getUserByUID(uid: userData!.uid);
        var data = jsonDecode(response.body);
        if (data['message'].isEmpty) {
          //check if user is in database
          app_user.User newUser = app_user.User(
            uid: userData.uid,
            email: userData.email,
            username: username,
            bio: bio,
            superUser: superUser,
            imgLink: imgLink,
          );
          http.Response response = await db.createUser(newUser);
          var data = jsonDecode(response.body);
          print(data); //print return message for developer purposes
        }
        //checks if this is a user's first time signing in
        if (userData.metadata.creationTime ==
            userData.metadata.lastSignInTime) {
          Navigator.of(context).pushReplacement(MaterialPageRoute(
              builder: (context) =>
                  const EditProfile())); //push to edit profile if yes
        } else {
          Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (context) => const MapScreen())); //push to mapscreen if returning user
        }
      }
      //error handling for google sign in 
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
