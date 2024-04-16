import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

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
        leading: BackButton(
          onPressed: () => Navigator.pop(context),
        ),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      //creates the View Settings and Edit Profile buttons
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20), // Add spacing above the buttons
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Text(
                  'Username', // have this set so it takes 
                  //input from whenever edit profile is updated
                  //and persists until the next change
                  style: TextStyle(color: Color.fromARGB(255, 0, 0, 0)),
                ),
              ],
            ),
            const SizedBox(height: 5), // spacing between buttons and profile image/bio
            //creates the user's profile image and their bio
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
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
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              border: Border.all(color: const Color.fromARGB(255, 137, 137, 137), width: 0.5),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              "Insert Bio here...",
                              style: TextStyle(fontSize: 10),
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
                    // handles edit profile button press
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => EditProfile()),
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
            const Text(
              "User's Posts",
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 200), // Add spacing below the text
            const Text(
              "No Posts Yet",
              style: TextStyle(fontSize: 18,
              color: Color.fromARGB(255, 137, 137, 137)),
            ),
          ],
        ),
      ),
    );
  } 
}

// ignore: must_be_immutable
class EditProfile extends StatelessWidget {
  XFile? selectedProfileImage;
  final _profileImage = ImagePicker();

  EditProfile({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      body: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.all(30.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.image, size: 70),
                  Text("Change Profile Image",
                      style: TextStyle(fontSize: 20)),
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                OutlinedButton(
                  onPressed: getImageFromGallery,
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all<Color>(
                      const Color.fromARGB(255, 92, 110, 71),
                    ),
                  ),
                  child: const Text("Upload from library",
                    style: TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                  ),
                ),
                OutlinedButton(
                  onPressed: getImageFromCamera,
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all<Color>(
                      const Color.fromARGB(255, 92, 110, 71),
                    ),
                  ),
                  child: const Text("Take a photo",
                    style: TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                  )
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Divider(
              color: Colors.black,
              thickness: 0.25,
            ),
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15.0),
                  child: GestureDetector(
                    onTap: () {
                      // Navigate to separate page to edit name
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const NameEditPage()),
                      );
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Expanded(child: Text("Name: ")),
                      ],
                    ),
                  ),
                ),
                const Divider(
                  color: Colors.black,
                  thickness: 0.25,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15.0),
                  child: GestureDetector(
                    onTap: () {
                      // Navigate to separate page to edit username
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const UsernameEditPage()),
                      );
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Expanded(child: Text("Username: ")),
                      ],
                    ),
                  ),
                ),
                const Divider(
                  color: Colors.black,
                  thickness: 0.25,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15.0),
                  child: GestureDetector(
                    onTap: () {
                      // Navigate to separate page to edit pronouns
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const PronounsEditPage()),
                      );
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Expanded(child: Text("Pronouns: ")),
                      ],
                    ),
                  ),
                ),
                const Divider(
                  color: Colors.black,
                  thickness: 0.25,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15.0),
                  child: GestureDetector(
                    onTap: () {
                      // Navigate to separate page to edit bio
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const BioEditPage()),
                      );
                    },
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Expanded(child: Text("Bio: ")),
                      ],
                    ),
                  ),
                ),
                const Divider(
                  color: Colors.black,
                  thickness: 0.25,
                ),
              ],
            ),
          ]
        ),
      ),
    );
  }

  Future getImageFromGallery() async {
    selectedProfileImage = await _profileImage.pickImage(source: ImageSource.gallery);
  }

  Future getImageFromCamera() async {
    selectedProfileImage = await _profileImage.pickImage(source: ImageSource.camera);
  }
}

class NameEditPage extends StatelessWidget {
  const NameEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController nameController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Name'),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
            child: TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Enter name',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(30.0),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 92, 110, 71),
                minimumSize: const Size(375, 50),
              ),
              child: const Text('Save Changes',
                style: TextStyle(color: Color.fromARGB(255, 255, 255, 255))),
            ),
          ),
        ],
      ),
    );
  }
}

class UsernameEditPage extends StatelessWidget {
  const UsernameEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController userNameController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Username'),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
            child: TextField(
              controller: userNameController,
              decoration: const InputDecoration(
                labelText: 'Enter username',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(30.0),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 92, 110, 71),
                minimumSize: const Size(375, 50),
              ),
              child: const Text('Save Changes',
                style: TextStyle(color: Color.fromARGB(255, 255, 255, 255))),
            ),
          ),
        ],
      ),
    );
  }
}

class PronounsEditPage extends StatelessWidget {
  const PronounsEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController pronounsController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pronouns'),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
            child: TextField(
              controller: pronounsController,
              decoration: const InputDecoration(
                labelText: 'Enter pronouns',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(30.0),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 92, 110, 71),
                minimumSize: const Size(375, 50),
              ),
              child: const Text('Save Changes',
                style: TextStyle(color: Color.fromARGB(255, 255, 255, 255))),
            ),
          ),
        ],
      ),
    );
  }
}

class BioEditPage extends StatelessWidget {
  const BioEditPage({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController bioController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bio'),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15.0),
            child: TextField(
              controller: bioController,
              decoration: const InputDecoration(
                labelText: 'Enter bio',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(30.0),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 92, 110, 71),
                minimumSize: const Size(375, 50),
              ),
              child: const Text('Save Changes',
                style: TextStyle(color: Color.fromARGB(255, 255, 255, 255))),
            ),
          ),
        ],
      ),
    );
  }
}