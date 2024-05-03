import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:http/http.dart' as http;
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';
import 'dart:convert';

// Create a mock class for http.Client
class MockClient extends Mock implements http.Client {}

void main() {
  group('Post Database Tests', () {
    const testPid = '123';
    late Database db;
    late MockClient client;

    setUpAll(() {
      registerFallbackValue(Uri());
    });

    setUp(() {
      client = MockClient();
      db = Database(client: client); // Ensure your Database accepts a client
    });

    test('createPost sends an HTTP POST request and receives a response',
        () async {
      final post = Post(
          pid: '1',
          uid: '2',
          datetime: '11/03',
          coordinate: {'x': '0', 'y': '0'},
          animalName: 'Fox',
          quantity: 1,
          activity: 'Sleepy');
      final postJson = jsonEncode(post);

      // Setup the mocked http call
      when(() => client.post(
            any(),
            headers: any(named: 'headers'),
            body: postJson,
          )).thenAnswer(
        (_) async => http.Response('{"status": "success", "id": "123"}', 200),
      );

      // Execute the function
      final response = await db.createPost(post);

      // Validate the results
      expect(response.statusCode, 200);
      expect(jsonDecode(response.body)['status'], 'success');
      expect(jsonDecode(response.body)['id'], '123');

      // Verify that the correct URL, headers, and body were sent
      verify(() => client.post(
            Uri.parse('${db.endpoint}/posts/createPost'),
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: postJson,
          )).called(1);
    });

    test('updatePostByPID sends an HTTP PUT request and receives a response',
        () async {
      const pid = '123';
      const imgLink = 'http://example.com/image.jpg';

      // Setup the mocked http call
      when(() => client.put(
            any(),
            headers: any(named: 'headers'),
            body: any(named: 'body'),
          )).thenAnswer(
        (_) async => http.Response('{"status": "success"}', 200),
      );

      // Execute the function
      final response = await db.updatePostByPID(pid: pid, imgLink: imgLink);

      // Validate the results
      expect(response.statusCode, 200);
      expect(response.body, '{"message":"post with pid $pid updated"}');
    });

    test('deletePostByPID sends an HTTP DELETE request and returns a response',
        () async {
      // Setup the expected URL
      final expectedUrl =
          Uri.parse('${db.endpoint}/posts/deletePostByPID?pid=$testPid');

      // Setup the mocked call
      when(() => client.delete(
            expectedUrl, // Match the expected URI
            headers: any(named: 'headers'),
          )).thenAnswer(
        (_) async => http.Response('{"status": "success"}', 200),
      );

      // Execute the function
      final response = await db.deletePostByPID(pid: testPid);

      // Validate results
      expect(response.statusCode, 200);
      expect(response.body, '{"status": "success"}');

      // Verify the interaction with the HTTP client
      verify(() => client.delete(
            expectedUrl,
            headers: any(named: 'headers'),
          )).called(1);
    });

    test('getPostByPID send an HTTP GET request and returns a response',
        () async {
      const testPid = '123';
      final expectedUrl =
          Uri.parse('${db.endpoint}/posts/selectPost?pid=$testPid');
      final expectedResponse = {
        'pid': '123',
        'uid': '456',
        'datetime': '11/03',
        'coordinate': {'x': '0', 'y': '0'},
        'animalname': 'Fox',
        'quantity': 1,
        'activity': 'Sleepy',
        'imglink': 'http://example.com/image.jpg',
      };

      // Setup the mocked http call
      when(() => client.get(
            expectedUrl,
            headers: any(named: 'headers'),
          )).thenAnswer(
        (_) async => http.Response(jsonEncode(expectedResponse), 200),
      );

      // Execute the function
      final post = await db.getPostByPID(testPid);

      // Validate results
      expect(post, isNotNull);
      expect(post!.pid, expectedResponse['pid']);
      expect(post.uid, expectedResponse['uid']);
      expect(post.datetime, expectedResponse['datetime']);
      expect(post.coordinate, expectedResponse['coordinate']);
      expect(post.animalName, expectedResponse['animalname']);
      expect(post.quantity, expectedResponse['quantity']);
      expect(post.activity, expectedResponse['activity']);
      expect(post.imgLink, expectedResponse['imglink']);

      // Verify the interaction with the HTTP client
      verify(() => client.get(
            expectedUrl,
            headers: any(named: 'headers'),
          )).called(1);
    });
  });
}
