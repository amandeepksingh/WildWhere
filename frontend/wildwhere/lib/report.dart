import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:wildwhere/location.dart';
import 'package:geolocator/geolocator.dart';
import 'package:wildwhere/database.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:wildwhere/post.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ReportPage extends StatefulWidget {
  final Function? onPostCreated; // Callback function to update the map
  final OverlayPortalController controller;
  const ReportPage({super.key, this.onPostCreated, required this.controller});

  @override
  State<ReportPage> createState() => _ReportPageState();
}

class _ReportPageState extends State<ReportPage> {
  final _imagePicker = ImagePicker();
  String? uid = FirebaseAuth.instance.currentUser?.uid;
  File? selectedImage;
  String? imageLink;
  String? animal;
  int? quantity;
  String? activity;
  bool showError = false;

  @override
  void initState() {
    super.initState();
  }

  Future<void> submitOnPressed() async {
    if (animal == null || quantity == null || activity == null) {
      // If any selection is null, update the state to show the error message
      setState(() {
        showError = true;
      });
      return; // Stop further execution
    }
    resetErrorState();
    Location location = Location();
    Position position = await location.getCurrentLocation();
    Map<String, dynamic> coordinate = {
      'x': position.longitude.toString(),
      'y': position.latitude.toString()
    };
    String datetime = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());

    Post newPost = Post(
        uid: uid!,
        datetime: datetime,
        coordinate: coordinate,
        animalName: animal!,
        quantity: quantity!,
        activity: activity!,
        imgLink: imageLink);

    try {
      Database db = Database();
      http.Response response =
          await db.createPost(newPost); //Pass post object to createPost
      if (response.statusCode == 200) {
        var responseData = json.decode(response.body);
        print('New post: $responseData');
        var pid = responseData['pid'];
        print('PID: $pid');
        var data = await db.uploadPostPic(selectedImage!.path, pid);
        print('Image uploaded: $data');
        widget.onPostCreated!(); // Update the map
      } else {
        throw Exception('Failed to create post');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  void resetErrorState() {
    setState(() {
      showError = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      const ModalBarrier(
        dismissible:
            false, // Set to true if you want to allow dismissal by tapping outside the overlay
      ),
      BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
          child: Center(
              child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: SizedBox(
                      width: MediaQuery.of(context).size.width * 0.85,
                      height: MediaQuery.of(context).size.height * 0.55,
                      child: Scaffold(
                          appBar: AppBar(
                            leading: CloseButton(
                              onPressed: () {
                                widget.controller.toggle();
                              },
                            ),
                            title:
                                const Text('New Sighting', style: TextStyle()),
                          ),
                          body: Column(
                            children: [
                              SizedBox(height: 30),
                              if (showError) // Conditionally display the error message
                                const Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: Text(
                                    'Please fill out all selections.',
                                    style: TextStyle(
                                      color: Colors.red,
                                      backgroundColor: Colors.white,
                                    ),
                                  ),
                                ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                      width: 90,
                                      height: 90,
                                      child: ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(20),
                                          child: selectedImage != null
                                              ? Image.file(selectedImage!,
                                                  fit: BoxFit.cover)
                                              : const Icon(Icons.image_rounded,
                                                  size: 90))),
                                  SizedBox(width: 10),
                                  IntrinsicWidth(
                                      child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      ElevatedButton(
                                          onPressed: getImageFromGallery,
                                          child: const Text(
                                              "Upload from library")),
                                      ElevatedButton(
                                          onPressed: getImageFromCamera,
                                          child: const Text("Take a photo")),
                                    ],
                                  ))
                                ],
                              ),
                              const SizedBox(height: 40),
                              IntrinsicWidth(
                                  child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  animalTypeButton(),
                                  animalQuantityButton(),
                                  animalActivityButton()
                                ],
                              )),
                              Expanded(
                                  child: Align(
                                      alignment: const FractionalOffset(.5, .9),
                                      child: ElevatedButton(
                                          onPressed: () async {
                                            await submitOnPressed();
                                          },
                                          child: const Text('Submit')))),
                              const SizedBox(height: 20),
                            ],
                          ))))))
    ]);
  }

  Future getImageFromGallery() async {
    bool isGranted = await checkAndRequestPhotosPermission();
    if (!isGranted) {
      return;
    }
    XFile? newImage = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (newImage != null) {
      CroppedFile? croppedImage =
          await ImageCropper().cropImage(sourcePath: newImage.path);
      if (croppedImage != null) {
        setState(() {
          selectedImage = File(croppedImage.path);
        });
      }
    }
  }

  Future getImageFromCamera() async {
    bool isGranted = await checkAndRequestCameraPermission();
    if (!isGranted) {
      return;
    }
    XFile? newImage = await _imagePicker.pickImage(source: ImageSource.camera);
    if (newImage != null) {
      CroppedFile? croppedImage =
          await ImageCropper().cropImage(sourcePath: newImage.path);
      if (croppedImage != null) {
        setState(() {
          selectedImage = File(croppedImage.path);
        });
      }
    }
  }

  Future<bool> checkAndRequestPhotosPermission() async {
    var status = await Permission.photos.status;
    if (status.isGranted) {
      return true;
    } else if (status.isDenied) {
      status = await Permission.photos.request();
      return status.isGranted;
    } else if (status.isPermanentlyDenied) {
      openAppSettings(); // This can prompt the user to open app settings and change permission
      return false;
    }
    return false;
  }

  Future<bool> checkAndRequestCameraPermission() async {
    var status = await Permission.camera.status;
    if (status.isGranted) {
      return true;
    } else if (status.isDenied) {
      status = await Permission.photos.request();
      return status.isGranted;
    } else if (status.isPermanentlyDenied) {
      openAppSettings(); // This can prompt the user to open app settings and change permission
      return false;
    }
    return false;
  }

  Widget animalTypeButton() {
    return DropdownButton<String>(
      value: animal,
      isExpanded: true,
      items: <String>[
        'American Black Bear',
        'Canada Lynx',
        'Bobcat',
        'White-Tailed Deer',
        'Moose',
        'American Beaver',
        'Coyote',
        'Red Fox',
        'Gray Fox',
        'Eastern Cottontail',
        'New England Cottontail',
        'Snowshoe Hare',
        'European Hare',
        'Black-tailed Jackrabbit',
        'North American Porcupine',
        'Virginia Opossum',
        'Hairy-tailed Mole',
        'Eastern Mole',
        'Star-nosed Mole',
        'Common Raccoon',
        'Striped Skunk',
        'American Marten',
        'Fisher',
        'Short-tailed Weasel (Ermine)',
        'Long-tailed Weasel',
        'American Mink',
        'River Otter',
        'Eastern Chipmunk',
        'Woodchuck',
        'Eastern Gray Squirrel',
        'American Red Squirrel',
        'Northern Flying Squirrel',
        'Southern Flying Squirrel'
      ].map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value),
        );
      }).toList(),
      onChanged: (String? newAnimal) {
        setState(() {
          animal = newAnimal;
        });
      },
      hint: const Text('Select an animal'),
    );
  }

  Widget animalQuantityButton() {
    return DropdownButton<int>(
      value: quantity,
      isExpanded: true,
      items: <int>[1, 2, 3, 4, 5] // Changed from strings to integers
          .map<DropdownMenuItem<int>>((int value) {
        return DropdownMenuItem<int>(
          value: value,
          child: Text(value.toString()), // Convert int to string for display
        );
      }).toList(),
      onChanged: (int? newValue) {
        setState(() {
          quantity = newValue;
        });
      },
      hint: const Text('Select a quantity'),
    );
  }

  Widget animalActivityButton() {
    return DropdownButton<String>(
      value: activity,
      isExpanded: true,
      items: <String>[
        'Resting',
        'Foraging',
        'Socializing',
        'Hunting',
        'Mating',
        'Territorial Defense',
      ].map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value),
        );
      }).toList(),
      onChanged: (String? newActivity) {
        setState(() {
          activity = newActivity;
        });
      },
      hint: const Text('Select an activity'),
    );
  }
}
