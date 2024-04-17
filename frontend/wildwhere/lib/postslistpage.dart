import 'package:flutter/material.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';

class PostsListPage extends StatefulWidget {
  const PostsListPage({Key? key}) : super(key: key);

  @override
  _PostsListPageState createState() => _PostsListPageState();
}

class _PostsListPageState extends State<PostsListPage> {
  late Future<List<Post>> _posts;

  @override
  void initState() {
    super.initState();
    // Load the posts when the widget is initialized
    _posts = Database().getAllPosts();
  }

  @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: Text("All Posts"),
      backgroundColor: Colors.green,
    ),
    body: FutureBuilder<List<Post>>(
      future: _posts,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text("Error: ${snapshot.error}"));
        } else if (snapshot.data == null || snapshot.data!.isEmpty) {
          return Center(child: Text("No posts found"));
        } else {
          return ListView.builder(
            itemCount: snapshot.data!.length,
            itemBuilder: (context, index) {
              Post post = snapshot.data![index];
              String locationString = "Lat: ${post.coordinate['y']}, Long: ${post.coordinate['x']}";
              return ListTile(
                leading: post.imgLink != null
                    ? Image.network(post.imgLink!, width: 100, height: 100, fit: BoxFit.cover)
                    : const Icon(Icons.image_not_supported),
                title: Text(post.animalName ?? 'Unknown Animal'),
                subtitle: Text("${post.activity} observed at ${post.datetime}\nLocation: $locationString"),
                trailing: Text("Quantity: ${post.quantity}"),
              );
            },
          );
        }
      },
    ),
  );
}
}