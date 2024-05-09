import 'dart:io';
import 'package:wildwhere/stats_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:wildwhere/database.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class Query extends StatefulWidget {
  const Query({super.key});

  @override
  QueryState createState() => QueryState();
}

class QueryState extends State<Query> {
  List<String> selectedAnimals = [];
  DateTime? startDate;
  DateTime? endDate;
  TimeOfDay? startTime;
  TimeOfDay? endTime;
  final List<String> animals = [
    'American Black Bear',
    'Canada Lynx',
    'Bobcat',
    'White-Tailed Deer',
    'Moose',
    'American Beaver',
    'Coyote',
    'Red Fox',
    'Gray Fox',
    'Eastern Cottontail',
    'New England Cottontail',
    'Snowshoe Hare',
    'European Hare',
    'Black-tailed Jackrabbit',
    'North American Porcupine',
    'Virginia Opossum',
    'Hairy-tailed Mole',
    'Eastern Mole',
    'Star-nosed Mole',
    'Common Raccoon',
    'Striped Skunk',
    'American Marten',
    'Fisher',
    'Short-tailed Weasel (Ermine)',
    'Long-tailed Weasel',
    'American Mink',
    'River Otter',
    'Eastern Chipmunk',
    'Woodchuck',
    'Eastern Gray Squirrel',
    'American Red Squirrel',
    'Northern Flying Squirrel',
    'Southern Flying Squirrel'
  ];

  final List<String> activities = [
    'Resting',
    'Foraging',
    'Socializing',
    'Hunting',
    'Mating',
    'Territorial Defense'
  ];

  final List<int> quantities = [1, 2, 3, 4, 5];

  void toggleSelection(String animal) {
    setState(() {
      if (selectedAnimals.contains(animal)) {
        selectedAnimals.remove(animal);
      } else {
        selectedAnimals.add(animal);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Data & Statistics'),
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(CupertinoIcons.arrow_down_doc_fill)),
              Tab(icon: Icon(Icons.insert_chart_rounded)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(15),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Text(
                        'Select Animals:',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemCount: animals.length,
                      itemBuilder: (context, index) {
                        final animal = animals[index];
                        return CheckboxListTile(
                          title: Text(animal),
                          value: selectedAnimals.contains(animal),
                          onChanged: (bool? value) {
                            if (value != null) {
                              setState(() {
                                toggleSelection(animal);
                              });
                            }
                          },
                        );
                      },
                    ),
                    const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Text(
                        'Select Date Range:',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: ListTile(
                              title: const Text('Start Date:'),
                              subtitle: startDate != null
                                  ? Text(
                                      '${startDate!.year}-${startDate!.month}-${startDate!.day}')
                                  : const Text('YYYY/MM/DD'),
                              onTap: () async {
                                DateTime? selectedDate = await showDatePicker(
                                  context: context,
                                  initialDate: DateTime.now(),
                                  firstDate: DateTime(2020),
                                  lastDate: DateTime(2030),
                                );
                                if (selectedDate != null) {
                                  setState(() {
                                    startDate = selectedDate;
                                  });
                                }
                              },
                            ),
                          ),
                          Expanded(
                            child: ListTile(
                              title: const Text('End Date:'),
                              subtitle: endDate != null
                                  ? Text(
                                      '${endDate!.year}-${endDate!.month}-${endDate!.day}')
                                  : const Text('YYYY/MM/DD'),
                              onTap: () async {
                                DateTime? selectedDate = await showDatePicker(
                                  context: context,
                                  initialDate: DateTime.now(),
                                  firstDate: DateTime(2020),
                                  lastDate: DateTime(2030),
                                );
                                if (selectedDate != null) {
                                  setState(() {
                                    endDate = selectedDate;
                                  });
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                    FloatingActionButton(
                      onPressed: () async {
                        var query = await Database()
                            .getQuery(selectedAnimals, startDate, endDate);
                        var formattedQuery = formatQuery(query);
                        String filePath = await saveToFile(formattedQuery);
                        shareFile(filePath);
                      },
                      child: const Icon(Icons.send),
                    ),
                  ],
                ),
              ),
            ),
            StatsPage(),
          ],
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.endDocked,
      ),
    );
  }

  void shareFile(String filePath) {
    Share.shareXFiles([XFile(filePath)], text: 'Here is your file!');
  }

  String formatQuery(List<dynamic> query) {
    String formattedResponse = '';
    for (int i = 0; i < query.length; i++) {
      formattedResponse += 'Post ID: ${query[i]['pid']}\n';
      formattedResponse += 'Image Link: ${query[i]['imglink']}\n';
      formattedResponse +=
          'Date Time: ${DateTime.parse(query[i]['datetime']).toString()}\n';
      formattedResponse +=
          'Coordinates: (${query[i]['coordinate']['x']}, ${query[i]['coordinate']['y']})\n';
      formattedResponse += 'Animal Name: ${query[i]['animalname']}\n';
      formattedResponse += 'Quantity: ${query[i]['quantity']}\n';
      formattedResponse += 'Activity: ${query[i]['activity']}\n';
      formattedResponse += 'State: ${query[i]['state']}\n';
      formattedResponse += 'City: ${query[i]['city']}\n\n';
    }
    return formattedResponse;
  }

  Future<String> saveToFile(String data) async {
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/response.txt');
    await file.writeAsString(data);
    return file.path;
  }
}
