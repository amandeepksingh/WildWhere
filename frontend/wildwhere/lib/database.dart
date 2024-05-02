import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wildwhere/post.dart';
import 'package:wildwhere/user.dart';

class Database {
  String endpoint = 'http://ec2-3-23-98-233.us-east-2.compute.amazonaws.com:80';
  final http.Client client;

  Database({http.Client? client}) : client = client ?? http.Client();

  Future<List<Post>> getAllPosts() async {
    var url = Uri.parse('$endpoint/posts/selectPost');

    var response = await client.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );

    if (response.statusCode == 200) {
      Map<String, dynamic> data = json.decode(response.body);
      List<dynamic> postsJson = data['message'];
      return postsJson.map((json) => Post.fromJson(json)).toList();
    } else {
      // Error handling if the request fails
      throw Exception(
          'Failed to fetch posts. Server responded with ${response.statusCode}: ${response.body}');
    }
  }

  Future<List<Post>> getAllUserPosts(String uid) async {
    var url = Uri.parse('$endpoint/posts/selectPost?uid=$uid');

    var response = await client.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );

    if (response.statusCode == 200) {
      Map<String, dynamic> data = json.decode(response.body);
      List<dynamic> postsJson = data['message'];
      return postsJson.map((json) => Post.fromJson(json)).toList();
    } else {
      // Error handling if the request fails
      throw Exception(
          'Failed to fetch posts. Server responded with ${response.statusCode}: ${response.body}');
    }
  }

  Future<http.Response> createPost(Post post) async {
    var url = Uri.parse('$endpoint/posts/createPost');
    var jsonData = jsonEncode(post);
    var response = await client.post(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonData,
    );
    return response;
  }

  Future<Post?> getPostByPID(String pid) async {
    var url = Uri.parse('$endpoint/posts/selectPost?pid=$pid');
    var response = await client.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    if (response.statusCode == 200) {
      return Post.fromJson(json.decode(response.body));
    }
    return null;
  }

  //Only handles updating post images for now
  Future<http.Response> updatePostByPID({
    required String pid,
    required String imgLink,
  }) async {
    var url = Uri.parse('$endpoint/posts/updatePostByPID');
    // Encode the request body as JSON
    String jsonBody = jsonEncode({"pid": pid, "imgLink": imgLink});
    // Make the HTTP PUT request with the JSON-encoded body
    var response = await http.put(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonBody,
    );
    return response;
  }

  Future<http.Response> deletePostByPID({required String pid}) async {
    var url = Uri.parse('$endpoint/posts/deletePostByPID?pid=$pid');
    var response = await client.delete(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    return response;
  }

  Future<http.Response> getUserByUID({required String uid}) async {
    var url = Uri.parse('$endpoint/users/selectUser?uid=$uid');
    var response = await client.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    return response;
  }

  Future<http.Response> createUser(User user) async {
    var url = Uri.parse('$endpoint/users/createUser');
    var jsonData = jsonEncode(user);
    var response = await client.post(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonData,
    );
    return response;
  }

  Future<http.Response> updateUserByUID(
      {required String uid,
      String? email,
      String? username,
      String? bio,
      String? imgLink,
      bool? superUser}) async {
    var url = Uri.parse('$endpoint/users/updateUserByUID');
    Map<String, dynamic> jsonBody = {
      "uid": uid,
      if (email != null) "email": email,
      if (username != null) "username": username,
      "bio": bio,
      if (imgLink != null) "imglink": imgLink,
      if (superUser != null) "superUser": superUser,
    };
    var data = jsonEncode(jsonBody);
    var response = await client.put(url,
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: data);
    return response;
  }

  Future<Map<String, dynamic>> getCurrentUser(String uid) async {
    Database db = Database();
    var response = await db.getUserByUID(uid: uid);
    Map<String, dynamic> data = jsonDecode(response.body);

    // Check if 'message' key exists and has at least one item
    if (data.containsKey('message') && data['message'].isNotEmpty) {
      return data['message']
          [0]; // Return the first user object in the 'message' list
    } else {
      throw Exception('User data is empty or malformed');
    }
  }

  Future<String> uploadProfilePic(String fileName, String uid) async {
    var request = http.MultipartRequest(
        'POST', Uri.parse('$endpoint/images/userProfilePic/upload'));
    request.fields['uid'] = uid;
    request.files.add(await http.MultipartFile.fromPath('img', fileName));
    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    var data = jsonDecode(response.body);
    return data['message'];
  }

  Future<String> uploadPostPic(String fileName, String pid) async {
    var request = http.MultipartRequest(
        'POST', Uri.parse('$endpoint/images/postPic/upload'));
    request.fields['pid'] = pid;
    request.files.add(await http.MultipartFile.fromPath('img', fileName));
    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    var data = jsonDecode(response.body);
    return data['message'];
  }

  Future<bool> uniqueUsername(String username) async {
    var url = Uri.parse('$endpoint/users/selectUser?username=$username');

    var response = await client.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    var data = jsonDecode(response.body);
    return data['message'][0] == '';
  }

  void initializePrefs(String userId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      var user = await getCurrentUser(userId);
      prefs.setString('username', user['username'] ?? '');
      prefs.setString('bio', user['bio'] ?? '');
      prefs.setString('email', user['email'] ?? '');
      prefs.setString('imagelink', user['imagelink']);
    } catch (e) {
      throw Exception("Error initializing user data: $e");
    }
  }
}
