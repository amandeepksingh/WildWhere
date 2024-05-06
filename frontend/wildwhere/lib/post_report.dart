import 'package:flutter/material.dart';

class PostReport extends StatefulWidget {
  const PostReport({super.key});

  @override
  State<PostReport> createState() => PostReportState();
}

class PostReportState extends State<PostReport> {
  final TextEditingController controller = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    setState(() {
      controller.text = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () {
        showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          builder: (BuildContext context) {
            return Padding(
              padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).viewInsets.bottom),
              child: SingleChildScrollView(
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20)),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    color: const Color.fromARGB(255, 206, 206, 205),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize
                            .min, // This ensures the content size adjusts to fit its children
                        children: <Widget>[
                          Container(
                            height: 10,
                            width: 100,
                            decoration: const BoxDecoration(
                              color: Colors.grey,
                              borderRadius:
                                  BorderRadius.all(Radius.elliptical(90, 45)),
                            ),
                          ),
                          const SizedBox(height: 20),
                          const Text("Tell us about the issue."),
                          //const SizedBox(height: 20),
                          const Padding(
                            padding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 16),
                            child: TextField(
                              maxLines: 5,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(),
                                hintText: 'Provide a brief description',
                              ),
                            ),
                          ),
                          //const SizedBox(height: 20),
                          ElevatedButton(
                            child: const Text('Submit Report'),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
      icon: const Icon(Icons.report_outlined),
    );
  }
}
