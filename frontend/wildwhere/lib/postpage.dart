import 'package:flutter/material.dart';
import 'package:wildwhere/post.dart';
import 'package:geocoding/geocoding.dart';
import 'package:wildwhere/database.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/user.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PostPage extends StatefulWidget {
  final Post post;

  const PostPage({Key? key, required this.post}) : super(key: key);

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
      post.coordinate['y'],
      post.coordinate['x']
    );
    return placemarks.first;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(post.animalName ?? 'Post'),
        leading: const BackButton(color: Colors.black87),
        actions: <Widget>[
          IconButton(
            icon: Icon(Icons.delete),
            onPressed: () async {

            }
          )
        ]
      ),
      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            post.imgLink != null
              ? Image.network(post.imgLink!)
              : const Image(image: AssetImage('assets/images/placeholder.png')),
            ListTile(
              title: Text('User:'),
              subtitle: Text(user?.username ?? 'Unknown'),
            ),
            ListTile(
              title: Text('Animal:'),
              subtitle: Text(post.animalName ?? 'Unknown'),
            ),
            ListTile(
              title: Text('Quantity:'),
              subtitle: Text(post.quantity.toString()),
            ),
            ListTile(
              title: Text('Activity:'),
              subtitle: Text(post.activity),
            ),
            FutureBuilder<Placemark>(
              future: getPlace(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.done &&
                    snapshot.hasData) {
                  return ListTile(
                    title: Text('Location'),
                    subtitle: Text("${snapshot.data!.locality}, ${snapshot.data!.administrativeArea}"),
                  );
                } else {
                  return ListTile(
                    title: Text('Location'),
                    subtitle: Text('Loading or unavailable'),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
