import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:wildwhere/post.dart';

class Database {

  Future<List<Post>> getAllPosts() async {
    var url = Uri.parse('http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/selectPost');

    var response = await http.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );


    if (response.statusCode == 200) {
      Map<String,dynamic> data = json.decode(response.body);
      List<dynamic> postsJson = data['message'];
      return postsJson.map((json) => Post.fromJson(json)).toList();
    } else {
      // Error handling if the request fails
      throw Exception('Failed to fetch posts. Server responded with ${response.statusCode}: ${response.body}');
    }
  }

  Future<http.Response> createPost(Post post) async {
    var url = Uri.parse('http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/createPost');
    var jsonData = jsonEncode(post.toJson());
    var response = await http.post(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonData,
    );
    return response;
  }
  
    Future<Post?> getPostByPID(String pid) async {
    var url = Uri.parse('http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/selectPost?pid=$pid');
    var response = await http.get(
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
    required imgLink
    }) async {
  
    var url = Uri.parse('http://ec2-3-138-136-228.us-east-2.compute.amazonaws.com/posts/updatePostByPID');
    Map<String, dynamic> jsonBody = {
      "pid" : pid,
      "imgLink" : imgLink
    };
    var response = await http.put(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonBody
    );
    return response;
  }

  Future<http.Response> deletePostByPID({
    required String pid
    }) async {

    var url = Uri.parse('http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/deletePostByPID?pid=$pid');
    var response = await http.delete(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    return response;
  }

}