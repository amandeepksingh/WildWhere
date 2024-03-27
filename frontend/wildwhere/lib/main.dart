import 'package:flutter/material.dart';
import 'package:wildwhere/login.dart';
import 'package:wildwhere/mapscreen.dart';

//Runs the application
void main() => runApp(const MyApp());

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
        home: const Login() //Landing page
    );
  }
}
