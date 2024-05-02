import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:wildwhere/database.dart';
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
  await FirebaseAuth.instance.signOut();
  UserController.init(); //refresh user token
  Database db = Database();
  if (UserController.user != null) {
    //user signed in
    db.initializePrefs(
        FirebaseAuth.instance.currentUser!.uid); //initialize preferences cache
  }
  runApp(const MyApp()); //initialize application
}

//Builds the app
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WildWhere Beta',
      theme: ThemeData(
          //settings for light mode
          brightness: Brightness.light,
          fontFamily: 'Open Sans',
          appBarTheme: const AppBarTheme(
              color: Color.fromARGB(255, 92, 110, 71),
              foregroundColor: Colors.white),
          floatingActionButtonTheme: const FloatingActionButtonThemeData(
              backgroundColor: Color.fromARGB(255, 239, 239, 239),
              foregroundColor: Colors.black),
          elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                  backgroundColor: Color.fromARGB(255, 239, 239, 239),
                  foregroundColor: Colors.black))),
      darkTheme: ThemeData(
          //settings for dark mode
          brightness: Brightness.dark,
          fontFamily: 'Open Sans',
          appBarTheme: const AppBarTheme(
              color: Color.fromARGB(255, 92, 110, 71),
              foregroundColor: Colors.white),
          floatingActionButtonTheme: const FloatingActionButtonThemeData(
              backgroundColor: Color.fromARGB(255, 92, 110, 71),
              foregroundColor: Color.fromARGB(255, 206, 206, 206)),
          elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
            backgroundColor: Color.fromARGB(255, 92, 110, 71),
            foregroundColor: Color.fromARGB(255, 206, 206, 206),
          ))),
      themeMode: ThemeMode.light,
      /* 
         ThemeMode.system to follow system theme, 
         ThemeMode.light for light theme, 
         ThemeMode.dark for dark theme
      */
      home: UserController.user != null
          ? const MapScreen()
          : const Login(), //direct user based on login status
    );
  }
}
