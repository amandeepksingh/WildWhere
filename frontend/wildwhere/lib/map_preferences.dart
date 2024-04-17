import 'package:flutter/material.dart';

class MapPreferences extends StatelessWidget {
  const MapPreferences({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(50),
        width: MediaQuery.of(context).size.width * 0.85,
        height: MediaQuery.of(context).size.height * 0.6,
        decoration: BoxDecoration(
          border: Border.all(
            width: 3,
            color: Colors.black,
          ),
        ),
        child: Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            title: const Text('Map Preferences'),
          ),
          body: const Stack(
            children: <Widget>[
              Column(
                children: [

                ],
              )
            ],
          ),
        )
      )
    );
  }
}
