import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // For haptic feedback

class PostsListPage extends StatefulWidget {
  const PostsListPage({Key? key}) : super(key: key);

  @override
  _PostsListPageState createState() => _PostsListPageState();
}

class _PostsListPageState extends State<PostsListPage> {
  late Future<List<Post>> _futurePosts;

  @override
  void initState() {
    super.initState();
    _futurePosts = _loadPosts();
  }

  Future<List<Post>> _loadPosts() async {
    return Database().getAllPosts();
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
                String locationString =
                    "Lat: ${post.coordinate['y']}, Long: ${post.coordinate['x']}";
                return ListTile(
                  onLongPress: () async {
                    // Provide haptic feedback to indicate the deletion
                    HapticFeedback.heavyImpact();
                    // Confirm deletion with the user
                    bool confirmed = await _showConfirmationDialog(context);
                    if (confirmed) {
                      _deletePost(post.pid!, index);
                    }
                  },
                  leading: post.imgLink != null
                      ? Image.network(post.imgLink!,
                          width: 100, height: 100, fit: BoxFit.cover)
                      : const Icon(Icons.image_not_supported),
                  title: Text(post.animalName ?? 'Unknown Animal'),
                  subtitle: Text(
                      "${post.activity} observed at ${post.datetime}\nLocation: $locationString"),
                  trailing: Text("Quantity: ${post.quantity}"),
                );
              },
            );
          }
        },
      ),
    );
  }

  Future<bool> _showConfirmationDialog(BuildContext context) async {
    return await showDialog<bool>(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
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
}
