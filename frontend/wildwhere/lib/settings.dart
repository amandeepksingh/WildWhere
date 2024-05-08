import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/login.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool colorBlindToggle = false;
  bool largeTextToggle = false;
  bool notificationToggle = false;
  double sliderValue = 0.0;

  @override
  void initState() {
    super.initState();
    loadSettings();
  }

  Future<void> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      colorBlindToggle = prefs.getBool('colorBlindToggle') ?? false;
      largeTextToggle = prefs.getBool('largeTextToggle') ?? false;
      notificationToggle = prefs.getBool('notificationToggle') ?? true;
      sliderValue = prefs.getDouble('sliderValue') ?? 0.0;
    });
  }

  Future<void> saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('colorBlindToggle', colorBlindToggle);
    await prefs.setBool('largeTextToggle', largeTextToggle);
    await prefs.setBool('notificationToggle', notificationToggle);
    await prefs.setDouble('sliderValue', sliderValue);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
        elevation: 0,
        shadowColor: Colors.transparent,
        forceMaterialTransparency: true,
      ),
      body: ListView(
        children: [
          Padding(
            padding: const EdgeInsets.only(
                left: 10.0, top: 10.0, bottom: 5.0, right: 10.0),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Padding(
                padding: EdgeInsets.only(left: 2.0, top: 10.0, bottom: 0.0),
                child: Text(
                  'Accessibility', // The title text for the container
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                  alignment: Alignment.center,
                  height: MediaQuery.of(context).size.height * 0.065,
                  padding: const EdgeInsets.only(
                      left: 0, top: 7, bottom: 4, right: 5),
                  margin: const EdgeInsets.only(
                      top: 7), // Give some space between the title and the box
                  decoration: BoxDecoration(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.grey.shade500
                        : const Color.fromARGB(255, 255, 255, 255),
                    borderRadius: const BorderRadius.all(Radius.circular(15)),
                  ),
                  child: Column(children: [
                    CupertinoListTile(
                        title: const Text('Color Blind Mode'),
                        trailing: CupertinoSwitch(
                            value: colorBlindToggle,
                            activeColor:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Colors.green.shade200
                                    : const Color(0xFF5E9040),
                            onChanged: (value) {
                              setState(() {
                                colorBlindToggle = value;
                                saveSettings();
                              });
                            })),
                  ])),
              const Padding(
                padding: EdgeInsets.only(left: 2.0, top: 20.0, bottom: 0.0),
                child: Text(
                  'Notifications', // The title text for the container
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    // Adjust color and font styling as needed
                  ),
                ),
              ),
              Container(
                alignment: Alignment.center,
                height: MediaQuery.of(context).size.height * 0.235,
                padding:
                    const EdgeInsets.only(left: 0, top: 7, bottom: 7, right: 5),
                margin: const EdgeInsets.only(
                    top: 7), // Give some space between the title and the box
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? Colors.grey.shade500
                      : const Color.fromARGB(255, 255, 255, 255),
                  borderRadius: BorderRadius.all(Radius.circular(15)),
                ),
                child: Column(
                  children: [
                    CupertinoListTile(
                        title: const Text('Allow Notifications'),
                        trailing: CupertinoSwitch(
                            value: notificationToggle,
                            activeColor:
                                Theme.of(context).brightness == Brightness.dark
                                    ? Colors.green.shade200
                                    : const Color(0xFF5E9040),
                            onChanged: (bool value) {
                              setState(() {
                                notificationToggle = value;
                                saveSettings();
                              });
                            })),
                    const Divider(indent: 15, endIndent: 15),
                    const CupertinoListTile(
                      title: Padding(
                        padding: EdgeInsets.only(
                            top: 8.0, bottom: 6.0, left: 0.0, right: 0.0),
                        child: Text(
                          'Notification Radius',
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(
                          top: 0.0, bottom: 5.0, left: 10.0, right: 10.0),
                      child: Column(
                        children: [
                          SliderTheme(
                            data: SliderTheme.of(context).copyWith(
                              
                              showValueIndicator: ShowValueIndicator.always,
                              valueIndicatorColor:
                                  CupertinoColors.lightBackgroundGray,
                              valueIndicatorTextStyle:
                                  const TextStyle(color: Colors.black),
                              allowedInteraction: SliderInteraction.tapAndSlide,
                              thumbColor: CupertinoColors.white,
                              thumbShape: const RoundSliderThumbShape(
                                  enabledThumbRadius: 15.0,
                                  elevation: 1.0,
                                  pressedElevation: 1.0),
                              trackShape: const RoundedRectSliderTrackShape(),
                              trackHeight: 2.0,
                              overlayColor: Colors.transparent,
                            ),
                            child: Slider(
                              value: sliderValue,
                              onChanged: (double value) {
                                setState(() {
                                  sliderValue = value;
                                  saveSettings();
                                });
                              },
                              label: '${sliderValue.toStringAsFixed(1)} miles',
                              min: 0.0,
                              max: 50.0,
                            ),
                          ),
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Padding(
                                padding:
                                    EdgeInsets.only(left: 10.0, bottom: 1.0),
                                child: Text(
                                  '0 mi', // Minimum value label
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w400,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                              Padding(
                                padding:
                                    EdgeInsets.only(right: 10.0, bottom: 1.0),
                                child: Text(
                                  '50 mi', // Maximum value label
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w400,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              Container(
                width: double
                    .infinity, // Ensures the container takes up all horizontal space
                child: TextButton(
                  style: ButtonStyle(
                    fixedSize: MaterialStateProperty.all(Size.fromHeight(
                        MediaQuery.of(context).size.height * 0.065)),
                    padding: MaterialStateProperty.all(
                        EdgeInsets.zero), // Removes any intrinsic padding
                    backgroundColor: Theme.of(context).brightness ==
                            Brightness.dark
                        ? MaterialStateProperty.all(Colors.grey.shade700)
                        : MaterialStateProperty.all(
                            Colors.white), // Optional: sets background color
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(
                          15), // Keeps the rounded corners
                    )),
                  ),
                  onPressed: () async {
                    bool confirmed = await _showConfirmationDialog(context);
                    if (confirmed) {
                      await FirebaseAuth.instance.signOut();
                      await GoogleSignIn().signOut();
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.clear();
                      Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                              builder: (context) => const Login()));
                    }
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        vertical:
                            10.0), // Adjustable padding for button content
                    child: Text(
                      'Sign Out',
                      style: TextStyle(
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.red.shade300
                            : Colors.red,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              )
            ]),
          ),
        ],
      ),
    );
  }

  Future<bool> _showConfirmationDialog(BuildContext context) async {
    return await showDialog<bool>(
          context: context,
          builder: (BuildContext context) {
            return CupertinoAlertDialog(
              content: const Text("Are you sure you want to log out?",
                  style: TextStyle(fontSize: 14)),
              actions: <Widget>[
                TextButton(
                  child: const Text("No"),
                  onPressed: () => Navigator.of(context).pop(false),
                ),
                TextButton(
                  child: const Text("Yes"),
                  onPressed: () => Navigator.of(context).pop(true),
                ),
              ],
            );
          },
        ) ??
        false; // In case the dialog is dismissed by tapping outside, return false.
  }
}
