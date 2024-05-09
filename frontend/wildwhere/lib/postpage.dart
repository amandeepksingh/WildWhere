import 'package:flutter/material.dart';
import 'package:wildwhere/post.dart';
import 'package:geocoding/geocoding.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post_report.dart';
import 'package:wildwhere/user.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:wildwhere/profile.dart';
import 'package:intl/intl.dart';

class PostPage extends StatefulWidget {
  final Post post;

  const PostPage({super.key, required this.post});

  @override
  _PostPageState createState() => _PostPageState();
}

class _PostPageState extends State<PostPage> {
  late Post post;
  http.Response? response;
  String? uid;
  Database db = Database();
  User? user;

  @override
  void initState() {
    super.initState();
    post = widget.post;
    uid = post.uid;
    getUser();
  }

  void getUser() async {
    response = await db.getUserByUID(uid: uid!);
    var data = json.decode(response!.body);
    setState(() {
      user = User.fromJson(data['message'][0]);
    });
  }

  Future<Placemark> getPlace() async {
    List<Placemark> placemarks = await placemarkFromCoordinates(
        post.coordinate['y'], post.coordinate['x']);
    return placemarks.first;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          mainAxisAlignment: MainAxisAlignment.center,  
          crossAxisAlignment: CrossAxisAlignment.center,  
          children: [
            Text(
              user?.username?.toUpperCase() ?? 'UNKNOWN',  
              style: const TextStyle(
                fontSize: 13,
                color: Colors.black54,
                letterSpacing: 0.5,
              ),
            ),
            const Text(
              'Post',  // Static text for post
              style: TextStyle(
                color: Colors.black,
                fontWeight: FontWeight.bold,
                fontSize: 18
              ),
            ),
          ],
        ),
        centerTitle: true,
        actions: <Widget>[PostReport(post: post)],
        elevation: 1.0,
        shadowColor: Colors.black54,
        surfaceTintColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => Profile(uid: post.uid),  // Navigate using specific UID
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundImage: NetworkImage(user?.imgLink ?? 'https://via.placeholder.com/150'),
                      radius: 20,
                    ),
                    const SizedBox(width: 10),
                    Text(user?.username ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5)),
                  ],
                ),
              ),
            ),
            Image.network(
              post.imgLink ?? 'https://via.placeholder.com/400x400',
              fit: BoxFit.cover,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 8.0, right: 12.0, left: 12.0, bottom: 185.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    post.animalName ?? 'Unknown Animal',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)
                    ),
                  Text('Quantity: ${post.quantity}', style: (TextStyle(fontWeight: FontWeight.w400, letterSpacing: 0.3)),),
                  Text('Activity: ${post.activity}', style: (TextStyle(fontWeight: FontWeight.w400, letterSpacing: 0.3)),),
                  FutureBuilder<Placemark>(
                    future: getPlace(),
                    builder: (context, snapshot) {
                      return snapshot.connectionState == ConnectionState.done && snapshot.hasData
                        ? Text('${snapshot.data!.locality}, ${snapshot.data!.administrativeArea}', style: (TextStyle(fontWeight: FontWeight.w400, letterSpacing: 0.3)),)
                        : Text('Loading location...');
                    }
                  ),
                  Text(DateFormat('yyyy-MM-dd').format(DateTime.parse(post.datetime)), style: (TextStyle(fontWeight: FontWeight.w400, letterSpacing: 0.3)),),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

}
