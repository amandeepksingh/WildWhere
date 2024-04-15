import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:wildwhere/location.dart';
import 'package:geolocator/geolocator.dart';
import 'package:wildwhere/database.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';

class ReportPage extends StatefulWidget {
  const ReportPage({super.key});

  @override
  State<ReportPage> createState() => _ReportPageState();
}

class _ReportPageState extends State<ReportPage> {
  final _imagePicker = ImagePicker();
  late User? user;
  late String? uid;
  XFile? selectedImage;
  String? animal;
  String? quantity;
  String? activity;
  bool showError = false;

  @override
  void initState() {
    super.initState();
    user = FirebaseAuth.instance.currentUser;
    uid = user?.uid; // Use null-aware operator to handle null user
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
    Database db = Database();
    Position position = await location.currentLocation();
    String latitude = position.latitude.toString();
    String longitude = position.longitude.toString();
    String coordinate = '($longitude, $latitude)';
    String datetime = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
    try {
      http.Response postResponse = await db.createPost(
      uid: uid as String, datetime: datetime, coordinate: coordinate,
      animalname: animal as String, quantity: quantity as String, activity: activity as String);
      final Map<String, dynamic> newPost = json.decode(postResponse.body);
      if (postResponse.statusCode != 200) {
        throw Exception(postResponse.body);
      } else {
          var pid = newPost['pid']; 
          print("Post ID: $pid");
          
      }
    } catch (e) {
      throw Exception(e);
    }
  }

  void resetErrorState() {
    setState(() {
      showError = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Center(
        child: Container(
            margin: const EdgeInsets.fromLTRB(0, 0, 0, 20),
            width: MediaQuery.of(context).size.width * 0.85,
            height: MediaQuery.of(context).size.height * 0.65,
            decoration: BoxDecoration(
              border: Border.all(
                width: 3,
                color: Colors.black,
              ),
            ),
            child: Scaffold(
                appBar: AppBar(
                  automaticallyImplyLeading: false,
                  title: const Text('Sighting Report'),
                ),
                body: Column(
                  children: [
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
                    const Row(
                      children: [
                        Icon(Icons.image, size: 70),
                        Text("Select an image to upload",
                            style: TextStyle(fontSize: 20)),
                      ],
                    ),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        const SizedBox(width: 10),
                        IntrinsicWidth(
                            child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            OutlinedButton(
                                onPressed: getImageFromGallery,
                                child: const Text("Upload from library")),
                            OutlinedButton(
                                onPressed: getImageFromCamera,
                                child: const Text("Take a photo")),
                          ],
                        ))
                      ],
                    ),
                    const SizedBox(height: 40),
                    IntrinsicWidth(
                      child:
                      Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        animalTypeButton(),
                        animalQuantityButton(),
                        animalActivityButton()
                      ],
                    )
                    ),
                    Expanded(
                        child: Align(
                            alignment: const FractionalOffset(.5, .9),
                            child: ElevatedButton(
                                onPressed: () {
                                  submitOnPressed();
                                },
                                child: const Text('Submit'))))
                  ],
                ))));
  }

  Future getImageFromGallery() async {
    selectedImage = await _imagePicker.pickImage(source: ImageSource.gallery);
  }

  Future getImageFromCamera() async {
    selectedImage = await _imagePicker.pickImage(source: ImageSource.camera);
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
        ]
          .map<DropdownMenuItem<String>>((String value) {
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
    return DropdownButton<String>(
      value: quantity,
      isExpanded: true,
      items: <String>['1', '2', '3', '4', '5-10']
          .map<DropdownMenuItem<String>>((String value) {
        return DropdownMenuItem<String>(
          value: value,
          child: Text(value),
        );
      }).toList(),
      onChanged: (String? newQuantity) {
        setState(() {
          quantity = newQuantity;
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
        ]
          .map<DropdownMenuItem<String>>((String value) {
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

