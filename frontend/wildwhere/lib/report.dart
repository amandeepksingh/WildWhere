import 'package:flutter/material.dart';

class ReportPage extends StatefulWidget {
  const ReportPage({super.key});

  @override
  State<ReportPage> createState() => _ReportPageState();
}

class _ReportPageState extends State<ReportPage> {
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
