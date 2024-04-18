import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:wildwhere/edit_profile.dart';

class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<Profile> {
  String? username;
  String? pronouns;
  String? bio;
  String? email = FirebaseAuth.instance.currentUser?.email;
  XFile? image;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      Database db = Database();
      var currentUser =
          await db.getCurrentUser(FirebaseAuth.instance.currentUser!.uid);
      if (mounted) {
        // Check if the widget is still in the tree
        setState(() {
          username = currentUser['username'] ?? '';
          bio = currentUser['bio'] ?? '';
        });
      }
    });
  }

  void updateUsername(String newUsername) {
    setState(() => username = newUsername);
  }

  void updatePronouns(String newPronouns) {
    setState(() => pronouns = newPronouns);
  }

  void updateBio(String newBio) {
    setState(() => bio = newBio);
  }

  void updateEmail(String newEmail) {
    setState(() => email = newEmail);
  }

  void updateImage(XFile newImage) {
    setState(() => image = newImage);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //creates the top bar format of the user's profile
      appBar: AppBar(
        title: Text('$username'),
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
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20), // Add spacing above the buttons
            const SizedBox(
                height: 5), // spacing between buttons and profile image/bio
            //creates the user's profile image and their bio
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                          width: 120,
                          height: 120,
                          clipBehavior: Clip.antiAlias,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                          ),
                          child: Image.asset(
                              image?.path ??
                                  'assets/images/defaultUserProfileImg.jpeg',
                              fit: BoxFit.cover)),
                    ],
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    width: 230,
                    height: 75,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        border: Border.all(
                            color: const Color.fromARGB(255, 137, 137, 137),
                            width: 0.5),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        "$bio",
                        style: const TextStyle(fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10), // Add spacing above the buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => EditProfile(
                                onUpdateUsername: updateUsername,
                                onUpdatePronouns: updatePronouns,
                                onUpdateBio: updateBio,
                                onUpdateEmail: updateEmail,
                                onUpdateImage: updateImage,
                              )),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 92, 110, 71),
                    minimumSize: const Size(375, 50),
                  ),
                  child: const Text(
                    'Edit Profile',
                    style: TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12.5),
            //line dividing the user image/bio and the user's posts
            const Divider(
              color: Colors.black,
              thickness: 0.25,
            ),
            const SizedBox(height: 10),
            Text(
              "$username's Posts",
              style: const TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 200), // Add spacing below the text
            const Text(
              "No Posts Yet",
              style: TextStyle(
                  fontSize: 18, color: Color.fromARGB(255, 137, 137, 137)),
            ),
          ],
        ),
      ),
    );
  }
}
