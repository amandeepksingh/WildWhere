import 'package:flutter/material.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:convert';

class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<Profile> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //creates the top bar format of the user's profile
      appBar: AppBar(
        title: const Text('User Profile'),
        leading: BackButton(onPressed: () {
          final NavigatorState? navigator = Navigator.maybeOf(context);
          if (navigator!.canPop()) {
            Navigator.pop(context);
          } else {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => const MapScreen()));
          }
        }),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      //creates the View Settings and Edit Profile buttons
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 20), // Add spacing above the buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton(
                onPressed: () {
                  // handles view settings button press
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color.fromARGB(255, 92, 110, 71),
                ),
                child: Text(
                  'View Settings',
                  style: TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  // handles edit profile button press
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color.fromARGB(255, 92, 110, 71),
                ),
                child: Text(
                  'Edit Profile',
                  style: TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                ),
              ),
            ],
          ),
          SizedBox(height: 20), // spacing between buttons and profile image/bio
          //creates the user's profile image and their bio
          Container(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      'assets/images/defaultUserProfileImg.jpeg',
                      width: 100,
                      height: 100,
                    ),
                  ],
                ),
                SizedBox(
                  width: 275,
                  height: 75,
                  child: Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: const Color.fromARGB(255, 137, 137, 137),
                          width: 0.5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      "Insert Bio here...",
                      style: TextStyle(fontSize: 10),
                    ),
                  ),
                ),
              ],
            ),
          ),
          //line dividing the user image/bio and the user's posts
          Divider(
            color: Colors.black,
            thickness: 0.25,
          ),
          SizedBox(height: 10),
          Text(
            "User's Posts",
            style: TextStyle(fontSize: 18),
          ),
          SizedBox(height: 200), // Add spacing below the text
          Text(
            "No Posts Yet",
            style: TextStyle(
                fontSize: 18, color: const Color.fromARGB(255, 137, 137, 137)),
          ),
        ],
      ),
    );
  }
}
