import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:http/http.dart' as http;
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';
import 'dart:convert';

import 'package:wildwhere/user.dart';

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
        'message': [
          {
            'pid': '123',
            'uid': '456',
            'datetime': '11/03',
            'coordinate': {'x': '0', 'y': '0'},
            'animalname': 'Fox',
            'quantity': 1,
            'activity': 'Sleepy',
            'imglink': 'http://example.com/image.jpg',
          }
        ]
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
      expect(post!.pid, expectedResponse['message']![0]['pid']);
      expect(post.uid, expectedResponse['message']![0]['uid']);
      expect(post.datetime, expectedResponse['message']![0]['datetime']);
      expect(post.coordinate, expectedResponse['message']![0]['coordinate']);
      expect(post.animalName, expectedResponse['message']![0]['animalname']);
      expect(post.quantity, expectedResponse['message']![0]['quantity']);
      expect(post.activity, expectedResponse['message']![0]['activity']);
      expect(post.imgLink, expectedResponse['message']![0]['imglink']);

      // Verify the interaction with the HTTP client
      verify(() => client.get(
            expectedUrl,
            headers: any(named: 'headers'),
          )).called(1);
    });
  });

  group('User Database Tests', () {
    late Database db;
    late MockClient client;

    setUp(() {
      client = MockClient();
      db = Database(client: client); // Ensure your Database accepts a client
    });

    test('getUser retrieves user data if the user exists', () async {
      // Setup
      const testUid = 'user123';
      const mockResponse =
          '{"message":[{"uid":"user123","username":"TestUser"}]}';
      final expectedUrl =
          Uri.parse('${db.endpoint}/users/selectUser?uid=$testUid');

      when(() => client.get(
            expectedUrl,
            headers: any(named: 'headers'),
          )).thenAnswer((_) async => http.Response(mockResponse, 200));

      // Execution
      final result = await db.getUser(uid: testUid);

      // Verification
      expect(result, isA<User>());
      expect(result!.uid, 'user123');
      verify(() => client.get(
            expectedUrl,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
          )).called(1);
    });

    test('createUser sends user data and receives confirmation', () async {
      // Setup
      final user = User(uid: 'user123', username: 'TestUser');
      final expectedUrl = Uri.parse('${db.endpoint}/users/createUser');
      final userData = jsonEncode(user);

      when(() => client.post(
                expectedUrl,
                headers: any(named: 'headers'),
                body: userData,
              ))
          .thenAnswer((_) async => http.Response('{"status": "success"}', 200));

      // Execution
      final response = await db.createUser(user);

      // Verification
      expect(response.statusCode, 200);
      expect(jsonDecode(response.body)['status'], 'success');
      verify(() => client.post(
            expectedUrl,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: userData,
          )).called(1);
    });

    test('updateUserByUID updates user data correctly', () async {
      // Setup
      const testUid = 'user123';
      final expectedUrl = Uri.parse('${db.endpoint}/users/updateUserByUID');
      final updatedData = {
        "uid": "user123",
        "email": "test@example.com",
        "username": "UpdatedUser",
        "bio": "Updated bio",
        "imglink": "http://example.com/newimage.jpg",
        "superUser": true,
      };
      final jsonData = jsonEncode(updatedData);

      when(() => client.put(
                expectedUrl,
                headers: any(named: 'headers'),
                body: jsonData,
              ))
          .thenAnswer((_) async => http.Response('{"status": "success"}', 200));

      // Execution
      final response = await db.updateUserByUID(
          uid: testUid,
          email: "test@example.com",
          username: "UpdatedUser",
          bio: "Updated bio",
          imgLink: "http://example.com/newimage.jpg",
          superUser: true);

      // Verification
      expect(response.statusCode, 200);
      expect(jsonDecode(response.body)['status'], 'success');
      verify(() => client.put(
            expectedUrl,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: jsonData,
          )).called(1);
    });
  });
  group('Send Report Tests', () {
    late Database db;
    late MockClient client;

    setUp(() {
      client = MockClient();
      db = Database(client: client); // Ensure your Database accepts a client
    });
    test('sendReport sends an HTTP POST request and handles success', () async {
      // Setup
      const testReport = 'Inappropriate content';
      final testPost = Post(
        pid: 'post123',
        uid: 'user456',
        datetime: '2024-05-09',
        coordinate: {'x': '0', 'y': '0'},
        animalName: 'Fox',
        quantity: 1,
        activity: 'Sleepy',
      );
      final expectedUrl = Uri.parse('${db.endpoint}/reports/createReport');
      const expectedBody =
          '{"uid":"user456","pid":"post123","reason":"Inappropriate content"}';

      // Setup the mocked http call
      when(() => client.post(
            expectedUrl,
            headers: any(named: 'headers'),
            body: expectedBody,
          )).thenAnswer(
        (_) async => http.Response('{"status": "success"}', 200),
      );

      // Execution
      await db.sendReport(testReport, testPost);

      // Verification
      verify(() => client.post(
            expectedUrl,
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: expectedBody,
          )).called(1);
    });

    test('sendReport handles errors from HTTP client', () async {
      // Setup
      const testReport = 'Inappropriate content';
      final testPost = Post(
        pid: 'post123',
        uid: 'user456',
        datetime: '2024-05-09',
        coordinate: {'x': '0', 'y': '0'},
        animalName: 'Fox',
        quantity: 1,
        activity: 'Sleepy',
      );
      final expectedUrl = Uri.parse('${db.endpoint}/reports/createReport');
      const expectedBody =
          '{"uid":"user456","pid":"post123","reason":"Inappropriate content"}';

      // Setup the mocked http call to throw an error
      when(() => client.post(
            expectedUrl,
            headers: any(named: 'headers'),
            body: expectedBody,
          )).thenThrow(Exception('Failed to send report'));

      // Execution & Verification
      expect(() async => await db.sendReport(testReport, testPost),
          throwsException);
    });
  });

  group('Post Class Tests', () {
    test('toJson() method should return a valid JSON map', () {
      final post = Post(
        uid: 'user123',
        datetime: '2024-05-08',
        coordinate: {'x': 10, 'y': 20},
        quantity: 5,
        activity: 'sighting',
      );

      final jsonMap = post.toJson();

      expect(jsonMap['uid'], 'user123');
      expect(jsonMap['datetime'], '2024-05-08');
      expect(jsonMap['coordinate'], '(10, 20)');
      expect(jsonMap['quantity'], '5');
      expect(jsonMap['activity'], 'sighting');
    });

    test('fromJson() method should return a valid Post instance from JSON', () {
      final jsonMap = {
        'uid': 'user456',
        'datetime': '2024-05-08',
        'coordinate': {'x': 30, 'y': 40},
        'quantity': 3,
        'activity': 'feeding',
      };

      final post = Post.fromJson(jsonMap);

      expect(post.uid, 'user456');
      expect(post.datetime, '2024-05-08');
      expect(post.coordinate, {'x': 30, 'y': 40});
      expect(post.quantity, 3);
      expect(post.activity, 'feeding');
    });

    test('toJson() method should handle null values correctly', () {
      final post = Post(
        uid: 'user123',
        datetime: '2024-05-08',
        coordinate: {'x': 10, 'y': 20},
        quantity: 5,
        activity: 'sighting',
        animalName: null,
        imgLink: null,
      );

      final jsonMap = post.toJson();

      expect(jsonMap['animalName'], isNull);
      expect(jsonMap['imglink'], isNull);
    });

    test('fromJson() method should handle null values correctly', () {
      final jsonMap = {
        'uid': 'user456',
        'datetime': '2024-05-08',
        'coordinate': {'x': 30, 'y': 40},
        'quantity': 3,
        'activity': 'feeding',
        'animalname': null,
        'imglink': null,
      };

      final post = Post.fromJson(jsonMap);

      expect(post.animalName, isNull);
      expect(post.imgLink, isNull);
    });

    test(
        'fromJson() method should throw ArgumentError for missing required fields',
        () {
      final jsonMap = {
        'datetime': '2024-05-08',
        'coordinate': {'x': 30, 'y': 40},
        'quantity': 3,
        'activity': 'feeding',
      };

      expect(() => Post.fromJson(jsonMap), throwsArgumentError);
    });
  });
  group('User Class Tests', () {
    test('toJson() method should return a valid JSON map', () {
      final user = User(
        uid: 'user123',
        email: 'user123@example.com',
        username: 'user123',
        bio: 'Hello, I am user123',
        superUser: true,
        imgLink: 'https://example.com/user123.jpg',
      );

      final jsonMap = user.toJson();

      expect(jsonMap['uid'], 'user123');
      expect(jsonMap['email'], 'user123@example.com');
      expect(jsonMap['username'], 'user123');
      expect(jsonMap['bio'], 'Hello, I am user123');
      expect(jsonMap['superUser'], true);
      expect(jsonMap['imglink'], 'https://example.com/user123.jpg');
    });

    test('fromJson() method should return a valid User instance from JSON', () {
      final jsonMap = {
        'uid': 'user456',
        'email': 'user456@example.com',
        'username': 'user456',
        'bio': 'Hello, I am user456',
        'superUser': false,
        'imglink': 'https://example.com/user456.jpg',
      };

      final user = User.fromJson(jsonMap);

      expect(user.uid, 'user456');
      expect(user.email, 'user456@example.com');
      expect(user.username, 'user456');
      expect(user.bio, 'Hello, I am user456');
      expect(user.superUser, false);
      expect(user.imgLink, 'https://example.com/user456.jpg');
    });

    test('toJson() method should handle null values correctly', () {
      final user = User(
        uid: 'user123',
      );

      final jsonMap = user.toJson();

      expect(jsonMap['email'], isNull);
      expect(jsonMap['username'], isNull);
      expect(jsonMap['bio'], isNull);
      expect(jsonMap['superUser'], isNull);
      expect(jsonMap['imglink'], isNull);
    });

    test('fromJson() method should handle null values correctly', () {
      final jsonMap = {
        'uid': 'user456',
      };

      final user = User.fromJson(jsonMap);

      expect(user.email, isNull);
      expect(user.username, isNull);
      expect(user.bio, isNull);
      expect(user.superUser, isNull);
      expect(user.imgLink, isNull);
    });

    test(
        'fromJson() method should throw ArgumentError for missing required fields',
        () {
      final jsonMap = {
        'email': 'user789@example.com',
        'username': 'user789',
        'bio': 'Hello, I am user789',
        'superUser': false,
        'imglink': 'https://example.com/user789.jpg',
      };

      expect(() => User.fromJson(jsonMap), throwsArgumentError);
    });
  });
}
