import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool colorBlindToggle = false;
  bool largeTextToggle = false;
  bool notificationToggle = true;
  double sliderValue = 0.0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
        backgroundColor: const Color.fromARGB(255, 212, 246, 172),
      ),
      body: Container(
        child: ListView(
          children: [
            buttonHelper('Color Blind View', colorBlindToggle, (value) {
              setState(() {
                colorBlindToggle = value;
              });
            }, 'A view of the app that is accessible for those with color blindness'),
            buttonHelper('Larger Text View', largeTextToggle, (value) {
              setState(() {
                largeTextToggle = value;
              });
            }, 'Increases text size on all pages'),
            buttonHelper('Receive Notifications', notificationToggle, (value) {
              setState(() {
                notificationToggle = value;
              });
            }, 'Get notified when an animal is sighted near you'),
            Visibility(
              visible: notificationToggle,
              child: SliderHelper(
                value: sliderValue,
                onChanged: (newValue) {
                  setState(() {
                    sliderValue = newValue;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buttonHelper(String title, bool value, ValueChanged<bool> onChanged,
      String description) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SwitchListTile(
          title: Text(title),
          value: value,
          onChanged: onChanged,
          subtitle: Text(description),
        ),
        const Divider(),
      ],
    );
  }
}

class SliderHelper extends StatelessWidget {
  final double value;
  final ValueChanged<double> onChanged;

  const SliderHelper({super.key, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
            'Sighting Radius for Notifications: ${(value * 100).floor()} miles'),
        Slider.adaptive(
          value: value,
          onChanged: onChanged,
        ),
      ],
    );
  }
}
