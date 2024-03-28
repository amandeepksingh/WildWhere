import 'package:flutter/material.dart';

class ReportPage extends StatefulWidget {
  const ReportPage({super.key});

  @override
  State<ReportPage> createState() => _ReportPageState();
}

class _ReportPageState extends State<ReportPage> {
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
                      child: const Text('No file chosen'))
                ],
              ),
              const SizedBox(height: 20),
              textFields('Type of animal: ', MediaQuery.of(context).size.width * 0.35),
              const SizedBox(height: 20),
              textFields('Number of animals: ', MediaQuery.of(context).size.width * 0.35),
              const SizedBox(height: 20),
              textFields('Additional comments: ', MediaQuery.of(context).size.width * 0.35),
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
      ),
    ));
  }
}

Row textFields(String title, double size) {
  return Row(
    children: [
      const SizedBox(width: 10),
      Text(title, style: const TextStyle(fontSize: 16)),
      const SizedBox(width: 10),
      SizedBox(
        width: size,
        child: const TextField(
          decoration: InputDecoration(border: OutlineInputBorder()),
        ),
      ),
    ],
  );
}
