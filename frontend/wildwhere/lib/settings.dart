import 'package:flutter/material.dart';

void main() {
  runApp(const SettingApp());
}

class SettingApp extends StatelessWidget {
  const SettingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Settings Page',
      theme: ThemeData(
        colorScheme:
            ColorScheme.fromSeed(seedColor: const Color.fromARGB(255, 141, 217, 74)),
        useMaterial3: true,
      ),
      home: const SettingsPage(),
    );
  }
}

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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => const ReportPage(),
              ),
            );
          },
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color.fromARGB(255, 212, 246, 172),
              Colors.white,
            ],
          ),
        ),
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
            buttonHelper('Receive Notifications', notificationToggle,
                (value) {
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

  Widget buttonHelper(String title, bool value,
      ValueChanged<bool> onChanged, String description) {
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

  const SliderHelper(
      {super.key, required this.value, required this.onChanged});

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

class ReportPage extends StatelessWidget {
  const ReportPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sighting Report'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Row(children: [
              SizedBox(width: 20),
              Icon(Icons.image_rounded, size: 70),
              SizedBox(width: 20),
              Expanded(
                child: Text('Choose an image to upload',
                    style: TextStyle(fontSize: 20)),
              )
            ]),
            const SizedBox(height: 20),
            Row(
              children: [
                const SizedBox(width: 10),
                ElevatedButton(
                    onPressed: () {}, child: const Text('Choose File')),
                const SizedBox(width: 30),
                Container(
                    margin: const EdgeInsets.all(1.0),
                    padding: const EdgeInsets.all(4.0),
                    decoration: BoxDecoration(
                        border: Border.all(width: 2),
                        shape: BoxShape.rectangle,
                        borderRadius:
                            const BorderRadius.all(Radius.circular(10.0))),
                    child: Text('No file chosen'))
              ],
            ),
            const SizedBox(height: 20),
            textFields('Type of animal: '),
            const SizedBox(height: 20),
            textFields('Number of animals: '),
            const SizedBox(height: 20),
            textFields('Additional comments: '),
            const SizedBox(height: 40),
            Center(
              child: ElevatedButton(
                  onPressed: () {},
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(Colors.green),
                  ),
                  child: const Text('Submit',
                      style: TextStyle(color: Colors.white))),
            ),
          ],
        ),
      ),
    );
  }

  Row textFields(String title) {
    return Row(
      children: [
        const SizedBox(width: 10),
        Text(title, style: const TextStyle(fontSize: 16)),
        const SizedBox(width: 10),
        const SizedBox(
          width: 200,
          child: TextField(
            decoration: InputDecoration(border: OutlineInputBorder()),
          ),
        ),
      ],
    );
  }
}
