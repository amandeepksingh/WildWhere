import 'dart:io';
import 'package:image_cropper/image_cropper.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/profile.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:wildwhere/database.dart';

class EditProfile extends StatefulWidget {
  final SharedPreferences prefs;
  final bool? firstTimeSignin;
  final Function(File)? onUpdateImage;

  const EditProfile(
      {super.key,
      required this.prefs,
      this.firstTimeSignin,
      this.onUpdateImage});

  @override
  State<EditProfile> createState() => EditProfileState();
}

class EditProfileState extends State<EditProfile> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _pronounsController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final picker = ImagePicker();
  File? selectedProfileImage;

  @override
  void initState() {
    super.initState();
    setState(() {
      _usernameController.text = widget.prefs.getString('username') ?? '';
      _emailController.text = widget.prefs.getString('email') ?? '';
      _bioController.text = widget.prefs.getString('bio') ?? '';
      //_pronounsController.text = widger.prefs.getString('pronouns') ?? ''
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        leading: widget.firstTimeSignin == null
            ? BackButton(onPressed: () {
                final NavigatorState? navigator = Navigator.maybeOf(context);
                if (navigator!.canPop()) {
                  Navigator.pop(context);
                } else {
                  Navigator.push(context,
                      MaterialPageRoute(builder: (context) => const Profile()));
                }
              })
            : null,
      ),
      body: SingleChildScrollView(
          child: Center(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.all(25.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                selectedProfileImage != null
                    ? Container(
                        width: 120,
                        height: 120,
                        clipBehavior: Clip.antiAlias,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                        ),
                        child: Image.file(
                          File(selectedProfileImage!.path),
                          fit: BoxFit.cover,
                        ),
                      )
                    : Container(
                        width: 120,
                        height: 120,
                        clipBehavior: Clip.antiAlias,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                        ),
                        child: Image.asset('assets/images/defaultpp.png'),
                      ),
                const SizedBox(width: 15),
                const Text("Edit Profile Image",
                    style: TextStyle(fontSize: 20)),
              ],
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton(
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
              ElevatedButton(
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
          Divider(
            color: Theme.of(context).brightness == Brightness.dark
                ? Colors.white // Color for dark theme
                : Colors.black, // Color for light theme
            thickness: 0.25,
          ),
          Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                  key: _formKey,
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
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a username';
                          }
                          return null; // null means no error
                        },
                      ),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                            border: UnderlineInputBorder(),
                            labelText: 'Email *',
                            labelStyle: TextStyle(color: Colors.red)),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter an email';
                          }
                          return null; // null means no error
                        },
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
                      const SizedBox(height: 30),
                      ElevatedButton(
                          onPressed: handleSave,
                          style: ButtonStyle(
                              backgroundColor: MaterialStateProperty.all<Color>(
                                const Color.fromARGB(255, 92, 110, 71),
                              ),
                              foregroundColor: MaterialStateProperty.all<Color>(
                                  const Color.fromARGB(255, 255, 255, 255))),
                          child: const Text('Save Changes')),
                    ],
                  )))
        ]),
      )),
    );
  }

  Future getImageFromGallery() async {
    XFile? selectedImage = await picker.pickImage(source: ImageSource.gallery);
    if (selectedImage != null) {
      CroppedFile? croppedImage =
          await ImageCropper().cropImage(sourcePath: selectedImage.path);
      if (croppedImage != null) {
        setState(() {
          selectedProfileImage = File(croppedImage.path);
        });
        if (widget.onUpdateImage != null) {
          widget.onUpdateImage!(selectedProfileImage!);
        }
      }
    }
  }

  Future getImageFromCamera() async {
    XFile? newImage = await picker.pickImage(source: ImageSource.camera);
    if (newImage != null) {
      CroppedFile? croppedImage =
          await ImageCropper().cropImage(sourcePath: newImage.path);
      if (croppedImage != null) {
        setState(() {
          selectedProfileImage = File(croppedImage.path);
        });
        if (widget.onUpdateImage != null) {
          widget.onUpdateImage!(selectedProfileImage!);
        }
      }
    }
  }

  void handleSave() async {
    if (_formKey.currentState!.validate()) {
      Database db = Database();
      await db.updateUserByUID(
        uid: FirebaseAuth.instance.currentUser!.uid,
        email: _emailController.text,
        username: _usernameController.text,
        bio: _bioController.text,
        //pronouns: _pronounsController.text
      );
      widget.prefs.setString('username', _usernameController.text);
      widget.prefs.setString('email', _emailController.text);
      widget.prefs.setString('bio', _bioController.text);
      //widget.prefs.setString('pronouns', _pronounsController.text);
      // For the image, check both if the callback and the selected image are not null
      if (selectedProfileImage != null && widget.onUpdateImage != null) {
        widget.onUpdateImage!(selectedProfileImage!);
        await db.uploadProfilePic(
            selectedProfileImage!.path, FirebaseAuth.instance.currentUser!.uid);
      }
      Navigator.pop(context, true);
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _pronounsController.dispose();
    _bioController.dispose();
    _emailController.dispose();
    super.dispose();
  }
}
