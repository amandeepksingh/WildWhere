import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:wildwhere/profile.dart';

class EditProfile extends StatefulWidget {
  final Function(String)? onUpdateUsername;
  final Function(String)? onUpdatePronouns;
  final Function(String)? onUpdateBio;
  final Function(String)? onUpdateEmail;

  const EditProfile({
    super.key,
    this.onUpdateUsername,
    this.onUpdatePronouns,
    this.onUpdateBio,
    this.onUpdateEmail,
  });

  @override
  State<EditProfile> createState() => EditProfileState();
}

class EditProfileState extends State<EditProfile> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _pronounsController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  XFile? selectedProfileImage;
  final _profileImage = ImagePicker();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
        leading: BackButton(onPressed: () {
          final NavigatorState? navigator = Navigator.maybeOf(context);
          if (navigator!.canPop()) {
            Navigator.pop(context);
          } else {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => const Profile()));
          }
        }),
      ),
      body: SingleChildScrollView(
          child: Center(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Padding(
            padding: EdgeInsets.all(30.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.image, size: 70),
                Text("Edit Profile Image", style: TextStyle(fontSize: 20)),
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
                child: const Text(
                  "Upload from library",
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
                  child: const Text(
                    "Take a photo",
                    style: TextStyle(color: Color.fromARGB(255, 255, 255, 255)),
                  )),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(
            color: Colors.black,
            thickness: 0.25,
          ),
          Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.max,
                children: [
                  TextFormField(
                    controller: _usernameController,
                    decoration: const InputDecoration(
                        border: UnderlineInputBorder(),
                        labelText: 'Username *',
                        labelStyle: TextStyle(color: Colors.red)),
                  ),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                        border: UnderlineInputBorder(),
                        labelText: 'Email *',
                        labelStyle: TextStyle(color: Colors.red)),
                  ),
                  TextFormField(
                    controller: _bioController,
                    decoration: const InputDecoration(
                      border: UnderlineInputBorder(),
                      labelText: 'Bio',
                    ),
                  ),
                  TextFormField(
                    controller: _pronounsController,
                    decoration: const InputDecoration(
                      border: UnderlineInputBorder(),
                      labelText: 'Pronouns',
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      widget.onUpdateUsername!(_usernameController.text);
                      widget.onUpdatePronouns!(_pronounsController.text);
                      widget.onUpdateBio!(_bioController.text);
                      widget.onUpdateEmail!(_emailController.text);
                      Navigator.pop(context);
                    },
                    child: const Text('Save Changes'),
                  ),
                ],
              ))
        ]),
      )),
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _pronounsController.dispose();
    _bioController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future getImageFromGallery() async {
    selectedProfileImage =
        await _profileImage.pickImage(source: ImageSource.gallery);
  }

  Future getImageFromCamera() async {
    selectedProfileImage =
        await _profileImage.pickImage(source: ImageSource.camera);
  }
}
