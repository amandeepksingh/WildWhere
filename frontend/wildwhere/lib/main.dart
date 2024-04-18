import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:wildwhere/login.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:wildwhere/user_controller.dart';
import 'firebase_options.dart';

//Runs the application
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  UserController.init();
  runApp(const MyApp());
}

//Builds the app
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WildWhere Beta',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: UserController.user != null ? const MapScreen() : const Login(),
    );
  }
}
