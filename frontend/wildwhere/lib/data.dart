import 'package:flutter/material.dart';

class Data extends StatelessWidget {
  const Data({super.key});

  @override 
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data & Statistics'),
        leading: BackButton(
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: 
      const Center(
        child: Text('Coming soon!'),
      )
    );
  } 
}