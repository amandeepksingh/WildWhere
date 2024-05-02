import 'package:flutter/material.dart';
import 'package:wildwhere/edit_profile.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<Profile> {
  String? username;
  String? pronouns;
  String? bio;
  String? email;
  String? imageLink;
  late SharedPreferences prefs;

  @override
  void initState() {
    super.initState();
    loadProfileData();
  }

  void loadProfileData() async {
    prefs = await SharedPreferences.getInstance();
    setState(() {
      username = prefs.getString('username');
      bio = (prefs.getString('bio')?.isEmpty == true
          ? 'Say something about yourself!'
          : prefs.getString('bio'));
      email = prefs.getString('email');
      imageLink = prefs.getString('imagelink');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      //creates the top bar format of the user's profile
      appBar: AppBar(
        title: Text('$username'),
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
                          child: (imageLink == null || imageLink == '')
                              ? Image.asset('assets/images/defaultpp.png',
                                  fit: BoxFit.cover)
                              : Image.network(imageLink!, fit: BoxFit.cover))
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
            const SizedBox(height: 18), // Add spacing above the buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () async {
                    // Await the Navigator.push and check the result.
                    bool? result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => EditProfile(prefs: prefs)),
                    );
                    // If 'result' is true, reload the profile data.
                    if (result == true) {
                      loadProfileData();
                    }
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
            Divider(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white // Color for dark theme
                  : const Color.fromARGB(
                      255, 126, 126, 126), // Color for light theme
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
                  fontSize: 18, color: Color.fromARGB(255, 176, 175, 175)),
            ),
          ],
        ),
      ),
    );
  }
}
