import 'dart:convert';
import 'package:http/http.dart' as http;

class Database {

  Future<http.Response> createPost({
    required String uid, 
    required String datetime, 
    required String coordinate,
    required String animalName,
    required String quantity, 
    required String activity,
    String? imgLink 
    }) async {

    var url = Uri.parse('http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/createPost');
    Map<String, dynamic> jsonBody = {};
    jsonBody['uid'] = uid;
    jsonBody['datetime'] = datetime;
    jsonBody['coordinate'] = coordinate;
    jsonBody['animal'] = animalName;
    jsonBody['quantity'] = quantity;
    jsonBody['activity'] = activity;
    if (imgLink != null) jsonBody['imgLink'] = imgLink;
    String json = jsonEncode(jsonBody);
    var response = await http.post(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: json,
    );
    return response;
  }

  Future<http.Response> getPostByPID(String pid) async {
    var url = Uri.parse('http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/selectPost?pid=$pid');
    var response = await http.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    return response;
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

    var url = Uri.parse('http://ec2-3-138-136-228.us-east-2.compute.amazonaws.com/posts/deletePostByPID?pid=$pid');
    var response = await http.delete(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    return response;
  }

}