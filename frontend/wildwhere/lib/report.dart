import 'dart:io';
import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
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
import 'package:wildwhere/animal_pictures.dart';

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
  String? animalType;
  String? animal;
  int? quantity;
  String? activity;
  bool showError = false;
  List<String> animalList = [];
  bool showAnimalRefs = false;
  Map<String, String> animalPics = AnimalPictures().animalPictures();

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
        var pid = responseData['pid'];
        if (selectedImage != null) {
          await db.uploadPostPic(selectedImage!.path, pid);
        }
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
    double interfaceHeight = MediaQuery.of(context).size.height * 0.55;

    if(showAnimalRefs){
      interfaceHeight += 30.0;
    }
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
                      height: interfaceHeight,
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
                              const SizedBox(height: 30),
                              if (showError) // Conditionally display the error message
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Text(
                                    'Please fill out all selections.',
                                    style: TextStyle(
                                      color: Theme.of(context).brightness ==
                                              Brightness.dark
                                          ? Colors.red.shade800
                                          : Colors.red,
                                      backgroundColor: Colors.transparent,
                                    ),
                                  ),
                                ),
                              Padding(
                                  padding: EdgeInsets.fromLTRB(10, 0, 10, 0),
                                  child: Container(
                                      decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                          color: Theme.of(context).brightness ==
                                                  Brightness.dark
                                              ? Colors.grey.shade700
                                              : Colors.white),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Container(
                                              width: 90,
                                              height: 90,
                                              child: ClipRRect(
                                                  borderRadius:
                                                      BorderRadius.circular(20),
                                                  child: selectedImage != null
                                                      ? Image.file(
                                                          selectedImage!,
                                                          fit: BoxFit.cover)
                                                      : Icon(
                                                          Icons
                                                              .image_not_supported,
                                                          size: 90,
                                                          color: Theme.of(context)
                                                                      .brightness ==
                                                                  Brightness
                                                                      .dark
                                                              ? Colors.grey
                                                              : Colors.grey,
                                                        ))),
                                          const SizedBox(width: 10),
                                          IntrinsicWidth(
                                              child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              TextButton.icon(
                                                  icon: const Icon(
                                                      CupertinoIcons
                                                          .photo_on_rectangle),
                                                  onPressed:
                                                      getImageFromGallery,
                                                  label: const Text(
                                                      "Upload from library")),
                                              TextButton.icon(
                                                  icon: const Icon(
                                                      CupertinoIcons.camera),
                                                  onPressed: getImageFromCamera,
                                                  label: const Text(
                                                      "Take a photo")),
                                            ],
                                          ))
                                        ],
                                      ))),
                              const SizedBox(height: 40),
                              IntrinsicWidth(
                                  child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  animalTypeButton(),
                                  Visibility(
                                    visible: showAnimalRefs,
                                    child: animalListButton(),
                                  ),
                                  animalQuantityButton(),
                                  animalActivityButton()
                                ],
                              )),
                              Expanded(
                                  child: Align(
                                      alignment: const FractionalOffset(.5, .9),
                                      child: TextButton(
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
      value: animalType,
      isExpanded: true,
      items: <String>[
        'Opossum',
        'Porcupine',
        'Dog-like Mammal (Coyote, Fox, etc.)',
        'Rodent',
        'Rabbit or Hare',
        'Bear',
        'Mustelid (Weasel, Otter, etc.)',
        'Mole',
        'Bat',
        'Skunk',
        'Raccoon',
        'Deer or Moose',
        'Cat'
      ].map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value),
        );
      }).toList(),
      onChanged: (String? selectedAnimalType) {
        setState(() {
          animalType = selectedAnimalType;
          if (selectedAnimalType != null) {
            animal = null; // Reset the selected animal when animalType changes
            showAnimalRefs = true; // Set visibility to true when animalType changes
          } else {
            showAnimalRefs = false; // Hide the animalListButton when no animalType is selected
          }
        });
      },
      hint: const Text('Select animal type'),
    );
  }

  Widget animalListButton() {
    if (animalType != null) {
      switch (animalType) {
        case 'Opossum':
          animalList = ['Virginia Opossum'];
          break;
        case 'Porcupine':
          animalList = ['North American Porcupine'];
          break;
        case 'Dog-like Mammal (Coyote, Fox, etc.)':
          animalList = ['Eastern Coyote', 'Red Fox', 'Gray Fox'];
          break;
        case 'Rodent':
          animalList = [
            'Eastern Chipmunk',
            'Woodchuck',
            'Eastern Gray Squirrel',
            'American Red Squirrel',
            'Northern Flying Squirrel',
            'Southern Flying Squirrel',
            'Meadow Jumping Mouse',
            'Woodland Jumping Mouse',
          ];
          break;
        case 'Rabbit or Hare':
          animalList = [
            'Eastern Cottontail',
            'New England Cottontail',
            'Snowshoe Hare',
            'European Hare',
            'Black-tailed Jackrabbit'
          ];
          break;
        case 'Bear':
          animalList = ['American Black Bear'];
          break;
        case 'Mustelid (Weasel, Otter, etc.)':
          animalList = [
            'American Marten',
            'Fisher',
            'Short-tailed Weasel',
            'Long-tailed Weasel',
            'American Mink',
            'River Otter',
            'American Beaver'
          ];
          break;
        case 'Mole':
          animalList = [
            'Hairy-tailed Mole',
            'Eastern Mole',
            'Star-nosed Mole'
          ];
          break;
        case 'Bat':
          animalList = [
            'Eastern Small-footed Myotis',
            'Little Brown Myotis',
            'Northern Long-eared Bat', 
            'Indiana Myotis', 
            'Silver-haired Bat', 
            'Eastern Pipistrelle', 
            'Red Bat', 
            'Hoary Bat'
          ]; // Add bat species if needed
          break;
        case 'Skunk':
          animalList = ['Striped Skunk'];
          break;
        case 'Raccoon':
          animalList = ['Common Raccoon'];
          break;
        case 'Deer or Moose':
          animalList = ['White-Tailed Deer', 'Moose'];
          break;
        case 'Cat':
          animalList = ['Canada Lynx', 'Bobcat'];
          break;
        default:
          // Default case: no animal selected or unknown type
          animalList = [];
      }
    }else{
      showAnimalRefs = false;
    }

    return SizedBox(
      height: 60.0,
      child: DropdownButton<String>(
        value: animal,
        isExpanded: true,
        items: animalList.map<DropdownMenuItem<String>>((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Row(
              children: [
                // Display the picture
                if (animalPics.containsKey(value))
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0, bottom: 2.0),
                    child: Padding(
                      padding: const EdgeInsets.all(2.0),
                      child: Image.asset(
                        animalPics[value]!,
                        width: 75, // Adjust the width as needed
                        height: 75, // Adjust the height as needed
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                // Display the animal name
                Text(value),
              ],
            ),
          );
        }).toList(),
        onChanged: (String? selectedAnimal) {
          setState(() {
            animal = selectedAnimal;
          });
        },
        hint: const Text('Select specific animal'),
      ),
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
