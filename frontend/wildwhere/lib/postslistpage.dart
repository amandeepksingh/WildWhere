import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/services.dart'; // For haptic feedback
import 'package:wildwhere/postpage.dart';

class PostsListPage extends StatefulWidget {
  const PostsListPage({Key? key}) : super(key: key);

  @override
  _PostsListPageState createState() => _PostsListPageState();
}

class _PostsListPageState extends State<PostsListPage> {
  late Future<List<Post>> _futurePosts;
  late SharedPreferences prefs;
  late bool superUser;

  @override
  void initState() {
    super.initState();
    _futurePosts = _loadPosts();
    _loadPreferences();
  }

  Future<List<Post>> _loadPosts() async {
    return Database().getAllPosts();
  }

  Future<void> _loadPreferences() async {
    prefs = await SharedPreferences.getInstance();
    bool fetchedSuperUser = prefs.getBool('superUser') ?? false;
    // Ensure widget is still mounted before updating state
    if (mounted) {
      setState(() {
        superUser = fetchedSuperUser;
      });
    }
  }

  Future<void> _deletePost(String pid, int index) async {
    await Database().deletePostByPID(pid: pid);
    setState(() {
      // Removing post from the list after successful deletion from the database
      _futurePosts =
          _futurePosts.then((List<Post> list) => list..removeAt(index));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text("All Posts"),
        ),
        body: FutureBuilder<List<Post>>(
            future: _futurePosts,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text("Error: ${snapshot.error}"));
              } else if (snapshot.data == null || snapshot.data!.isEmpty) {
                return const Center(child: Text("No posts found"));
              } else {
                return ListView.builder(
                    itemCount: snapshot.data!.length,
                    itemBuilder: (context, index) {
                      Post post = snapshot.data![index];
                      return InkWell(
                        onLongPress: () async {
                          if (superUser) {
                            HapticFeedback.heavyImpact();
                            bool confirmed =
                                await _showConfirmationDialog(context);
                            if (confirmed) {
                              _deletePost(post.pid!, index);
                            }
                          }
                        },
                        onTap: () async {
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => PostPage(
                                        post: post,
                                      )));
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(7),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Theme.of(context).brightness ==
                                      Brightness.dark
                                  ? Colors.grey.shade800
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Row(
                                children: <Widget>[
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(10),
                                    child: post.imgLink != null
                                        ? Image.network(post.imgLink!,
                                            width: 120,
                                            height: 115,
                                            fit: BoxFit.cover)
                                        : Icon(
                                            Icons.image_not_supported,
                                            size: 120,
                                            color:
                                                Theme.of(context).brightness ==
                                                        Brightness.dark
                                                    ? Colors.grey.shade300
                                                    : Colors.white,
                                          ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).brightness ==
                                                Brightness.dark
                                            ? Colors.grey.shade700
                                            : const Color.fromARGB(
                                                255, 243, 243, 243),
                                        borderRadius: BorderRadius.circular(5),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: <Widget>[
                                            Text(
                                                post.animalName ??
                                                    'Unknown Animal',
                                                style: const TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold)),
                                            FutureBuilder<Placemark>(
                                              future: getCityState(
                                                  post.coordinate['y'],
                                                  post.coordinate['x']),
                                              builder: (context, snapshot) {
                                                if (snapshot.connectionState ==
                                                    ConnectionState.waiting) {
                                                  return const Text(
                                                      "Loading location...");
                                                } else if (snapshot.hasData) {
                                                  Placemark placemark =
                                                      snapshot.data!;
                                                  DateTime dateTime =
                                                      DateTime.parse(
                                                          post.datetime);
                                                  String formattedDate =
                                                      DateFormat('yyyy-MM-dd')
                                                          .format(dateTime);
                                                  String formattedTime =
                                                      DateFormat('kk:mm')
                                                          .format(dateTime);
                                                  return Text(
                                                      "${post.activity} observed at\n$formattedTime on $formattedDate\nLocation: ${placemark.locality}, ${placemark.administrativeArea}");
                                                } else {
                                                  return const Text(
                                                      "Failed to load location");
                                                }
                                              },
                                            ),
                                            Text("Quantity: ${post.quantity}"),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    });
              }
            }));
  }

  Future<bool> _showConfirmationDialog(BuildContext context) async {
    return await showDialog<bool>(
          context: context,
          builder: (BuildContext context) {
            return CupertinoAlertDialog(
              title: const Text("Confirm Delete"),
              content: const Text("Are you sure you want to delete this post?"),
              actions: <Widget>[
                TextButton(
                  child: const Text("Cancel"),
                  onPressed: () => Navigator.of(context).pop(false),
                ),
                TextButton(
                  child: const Text("Delete"),
                  onPressed: () => Navigator.of(context).pop(true),
                ),
              ],
            );
          },
        ) ??
        false; // In case the dialog is dismissed by tapping outside, return false.
  }

  Future<Placemark> getCityState(var lat, var long) async {
    List<Placemark> placemarks = await placemarkFromCoordinates(lat, long);
    return placemarks[0];
  }
}
