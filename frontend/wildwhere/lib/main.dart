import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:wildwhere/postslistpage.dart';
import 'firebase_options.dart';
import 'package:wildwhere/login.dart';

//Runs the application
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

//Builds the app
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'WildWhere Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: const MapScreen() //Landing page
    );
  }
}
