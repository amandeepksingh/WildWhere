import 'package:flutter/material.dart';
import 'package:wildwhere/edit_profile.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';
import 'package:geocoding/geocoding.dart';
import 'package:wildwhere/postpage.dart';

class Profile extends StatefulWidget {
  const Profile({super.key});

  @override
  State<Profile> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<Profile> {
  String? username;
  String? pronouns;
  String? bio;
  String? email;
  String? imageLink;
  SharedPreferences? prefs;
  Map? user;
  Database db = Database();

  @override
  void initState() {
    super.initState();
    loadProfileData();
  }

  void loadProfileData() async {
    prefs = await SharedPreferences.getInstance();
    var fetchUid = prefs?.getString('uid');
    if (fetchUid == null) {
      print("Error: uid is null");
      return;
    }
    user = await db.getCurrentUser(fetchUid);
    setState(() {
      username = prefs?.getString('username') ?? 'Unknown user';
      bio = (prefs?.getString('bio')?.isEmpty ?? true)
          ? 'Say something about yourself!'
          : prefs!.getString('bio');
      email = prefs?.getString('email') ?? 'Unknown email';
      imageLink = user!['imglink'] ?? '';
    });
  }

  @override
  Widget build(BuildContext context) {
    if (prefs == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    return Scaffold(
      //creates the top bar format of the user's profile
      backgroundColor: const Color.fromARGB(255, 214, 249, 212),
      appBar: AppBar(
        title: Text('$username'),
        titleTextStyle: const TextStyle(
            color: Colors.black87, fontSize: 22, fontWeight: FontWeight.w700),
        leading: const BackButton(color: Colors.black87),
        actions: [
          IconButton(
            padding: const EdgeInsets.only(right: 10.0),
            icon: const Icon(Icons.edit_outlined),
            iconSize: 30.0,
            color: Colors.black87,
            onPressed: () async {
              bool? result = await Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => EditProfile(prefs: prefs!)),
              );
              // If 'result' is true, reload the profile data.
              if (result == true) {
                loadProfileData();
              }
            },
          )
        ],
        centerTitle: true,
        backgroundColor: const Color.fromARGB(255, 214, 249, 212),
        foregroundColor: const Color.fromARGB(255, 214, 249, 212),
        elevation: 0.0,
        shadowColor: Colors.black54,
        surfaceTintColor: Colors.transparent,
      ),
      //creates the View Settings and Edit Profile buttons
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20), // Add spacing above the buttons
            const SizedBox(
                height: 5), // spacing between buttons and profile image/bio
            //creates the user's profile image and their bio
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                          width: 120,
                          height: 120,
                          clipBehavior: Clip.antiAlias,
                          decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.grey,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black38,
                                  blurRadius: 6.0,
                                  spreadRadius: 1.0,
                                  offset: Offset(0, 5),
                                )
                              ]),
                          child: (imageLink == null || imageLink == '')
                              ? Image.asset('assets/images/defaultpp.png',
                                  fit: BoxFit.cover)
                              : Image.network(imageLink!, fit: BoxFit.cover))
                    ],
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    width: MediaQuery.of(context).size.width * 0.55,
                    height: MediaQuery.of(context).size.height * 0.14,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Text(
                        "$bio",
                        style: const TextStyle(fontSize: 15),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28), // Add spacing above the buttons
            //line dividing the user image/bio and the user's posts
            Divider(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white // Color for dark theme
                  : const Color.fromARGB(
                      255, 126, 126, 126), // Color for light theme
              thickness: 0.25,
              indent: 15.0,
              endIndent: 15.0,
            ),
            const SizedBox(height: 5),
            Padding(
                padding: const EdgeInsets.only(top: 3, bottom: 10),
                child: Text(
                  "$username's Posts",
                  style: const TextStyle(fontSize: 18),
                )),
            Divider(
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white // Color for dark theme
                  : const Color.fromARGB(
                      255, 126, 126, 126), // Color for light theme
              thickness: 0.25,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 7.0, bottom: 1.0),
              child: userPostsSection(),
            )
          ],
        ),
      ),
    );
  }

  Widget userPostsSection() {
    if (prefs == null) return const CircularProgressIndicator();
    var uid = prefs!.getString('uid')!;
    return FutureBuilder<List<Post>>(
      future: db.getAllUserPosts(uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        } else if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}');
        } else if (snapshot.data == null || snapshot.data!.isEmpty) {
          return const Text('No Posts Yet');
        } else {
          return ListView.separated(
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              Post post = snapshot.data![index];
              return InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PostPage(post: post),
                      ),
                    );
                  },
                  child: Container(
                      padding: const EdgeInsets.all(5),
                      decoration:
                          (const BoxDecoration(color: Colors.white, boxShadow: [
                        BoxShadow(
                          color: Colors.black12,
                          spreadRadius: 0,
                          blurRadius: 5.0,
                          offset: Offset(0, 3),
                        )
                      ])),
                      child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Container(
                              margin: const EdgeInsets.only(
                                  left: 5, top: 5, bottom: 5),
                              padding: const EdgeInsets.all(10),
                              width: 130,
                              height: 105,
                              decoration: BoxDecoration(
                                image: DecorationImage(
                                  image: NetworkImage(post.imgLink ??
                                      'https://via.placeholder.com/150'),
                                  fit: BoxFit.cover,
                                ),
                                borderRadius: BorderRadius.circular(15),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                                child: Padding(
                                    padding: const EdgeInsets.only(top: 7),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                            post.animalName ?? 'Unknown Animal',
                                            style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold)),
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
                                              Placemark place = snapshot.data!;
                                              return Text(
                                                  "Location: ${place.locality}, ${place.administrativeArea}");
                                            } else {
                                              return const Text(
                                                  "Location unknown");
                                            }
                                          },
                                        ),
                                        Text('Quantity: ${post.quantity}'),
                                        Text('Activity: ${post.activity}')
                                      ],
                                    )))
                          ])));
            },
            separatorBuilder: (context, index) => const SizedBox(height: 13),
          );
        }
      },
    );
  }

  Future<Placemark> getCityState(double lat, double long) async {
    List<Placemark> placemarks = await placemarkFromCoordinates(lat, long);
    return placemarks.first;
  }
}
