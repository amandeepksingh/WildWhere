import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/login.dart';
import 'package:wildwhere/mapscreen.dart';
import 'package:wildwhere/user_controller.dart';
import 'package:wildwhere/edit_profile.dart';
import 'firebase_options.dart';

//Runs the application
void main() async {
  Widget homeScreen = const Login(); //default to login screen
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  //await FirebaseAuth.instance.signOut();
  UserController.init(); //refresh user token
  Database db = Database();
  if (UserController.user != null) {
    //user signed in
    await db.initializePrefs(
        FirebaseAuth.instance.currentUser!.uid); //initialize preferences cache
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    /* check edge case where a new
     * user can close the app during 
     * intial edit profile process,
     * resulting in an empty username
     * on app startup
     */
    prefs.getString('username') == ''
        ? homeScreen = EditProfile(prefs: prefs, firstTimeSignin: true)
        : homeScreen = const MapScreen();
  }
  runApp(MyApp(homeScreen: homeScreen)); //initialize application
}

//Builds the app
class MyApp extends StatelessWidget {
  final Widget homeScreen;
  const MyApp({super.key, required this.homeScreen});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'WildWhere Beta',
        theme: ThemeData(
            //settings for light mode
            brightness: Brightness.light,
            fontFamily: 'Open Sans',
            scaffoldBackgroundColor: const Color.fromARGB(255, 214, 249, 212),
            appBarTheme: const AppBarTheme(
                titleTextStyle: TextStyle(
                    color: Colors.black87,
                    fontSize: 22,
                    fontWeight: FontWeight.w700),
                color: Color.fromARGB(255, 214, 249, 212),
                foregroundColor: Colors.black),
            floatingActionButtonTheme: const FloatingActionButtonThemeData(
                backgroundColor: Color.fromARGB(255, 239, 239, 239),
                foregroundColor: Colors.black),
            elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                    backgroundColor: Color.fromARGB(255, 243, 243, 243),
                    foregroundColor: Colors.black)),
            sliderTheme: const SliderThemeData(
              activeTrackColor: Color(0xFF5E9040),
              valueIndicatorColor: CupertinoColors.lightBackgroundGray,
              thumbColor: CupertinoColors.white,
              inactiveTrackColor: CupertinoColors.inactiveGray,
            ),
            textButtonTheme: const TextButtonThemeData(
                style: ButtonStyle(
              backgroundColor: MaterialStatePropertyAll(Colors.black),
            ))),
        darkTheme: ThemeData(
          //settings for dark mode
          brightness: Brightness.dark,
          fontFamily: 'Open Sans',

          appBarTheme: AppBarTheme(
              titleTextStyle: TextStyle(
                  color: Colors.green.shade200,
                  fontSize: 22,
                  fontWeight: FontWeight.w700),
              color: Colors.grey.shade900,
              foregroundColor: Colors.green.shade200),
          floatingActionButtonTheme: FloatingActionButtonThemeData(
              backgroundColor: Colors.grey.shade800,
              foregroundColor: Colors.green.shade200),
          elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green.shade300,
            foregroundColor: Colors.grey.shade900,
          )),
          dropdownMenuTheme: const DropdownMenuThemeData(
              menuStyle: MenuStyle(
            backgroundColor: MaterialStatePropertyAll(Colors.white),
          )),
          scaffoldBackgroundColor: Colors.grey.shade900,
          textButtonTheme: const TextButtonThemeData(
              style: ButtonStyle(
                  foregroundColor: MaterialStatePropertyAll(Colors.grey))),
          sliderTheme: SliderThemeData(
              inactiveTrackColor: Colors.black,
              activeTrackColor: Colors.green.shade200,
              valueIndicatorColor: Colors.grey.shade800),
        ),
        themeMode: ThemeMode.light,
        /* 
         ThemeMode.system to follow system theme, 
         ThemeMode.light for light theme, 
         ThemeMode.dark for dark theme
        */
        home: homeScreen);
  }
}
