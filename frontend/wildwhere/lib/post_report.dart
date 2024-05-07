import 'package:flutter/material.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';

class PostReport extends StatefulWidget {
  const PostReport({super.key, required this.post});
  final Post post;

  @override
  State<PostReport> createState() => PostReportState();
}

class PostReportState extends State<PostReport> {
  final TextEditingController controller = TextEditingController();
  bool? _validator;
  late Post post;

  @override
  void initState() {
    super.initState();
    setState(() {
      controller.text = '';
      post = widget.post;
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
            return StatefulBuilder(
              builder: (BuildContext context, StateSetter setModalState) {
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
                            mainAxisSize:
                                MainAxisSize.min, // Adjusts to children
                            children: <Widget>[
                              Container(
                                height: 10,
                                width: 130,
                                decoration: const BoxDecoration(
                                  color: Color.fromARGB(255, 168, 168, 168),
                                  borderRadius: BorderRadius.all(
                                      Radius.elliptical(90, 45)),
                                ),
                              ),
                              const SizedBox(height: 20),
                              const Text("Tell us about the issue."),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 16),
                                child: TextField(
                                  maxLines: 5,
                                  controller: controller,
                                  decoration: InputDecoration(
                                    border: const OutlineInputBorder(),
                                    hintText: '',
                                    errorText: (_validator == true)
                                        ? 'Description cannot be empty'
                                        : null,
                                  ),
                                ),
                              ),
                              ElevatedButton(
                                child: const Text('Submit Report'),
                                onPressed: () async {
                                  if (controller.text.isEmpty) {
                                    setModalState(() {
                                      _validator = true;
                                    });
                                  } else {
                                    await Database()
                                        .sendReport(controller.text, post);
                                    setModalState(() {
                                      _validator = false;
                                    });
                                    controller.clear();
                                    Navigator.pop(context);
                                  }
                                },
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
        ).then((_) {
          setState(() {
            _validator = false; // Reset the _validator when modal is closed
          });
        });
      },
      icon: const Icon(Icons.report_outlined),
    );
  }
}
