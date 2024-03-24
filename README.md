# WildWhere

## Frontend

## Backend

### Backend Setup

- Clone the git repo  
- Install Postgresql  
- Create a database called wildwhere  
- Run genTables.sql in the wildwhere database  
= Test that you can run the server and the tests

### Backend API

To run against the backend api, use the host listed for the EC2. This varies since it changes every time it's started up, but right now it is https://ec2-18-188-63-218.us-east-2.compute.amazonaws.com

You can add endpoints such as _/users/createUser_ onto the end to reach different endpoints the backend has set up. Each endpoint will support some method (_Post_, _Get_, _Put_, or _Delete_) and accept some input JSON body. These are specified below.

After sending a request to an endpoint with a method and input JSON body, you'll recieve a response (most of the time. Unless we haven't hit that edge case yet).

#### Example

Then you could  run a request to the endpoint _ec2Host/users/createUser_ that uses a _Post_ method and send _{uid: 582, username: John254}_ as its input JSON body.

##### In browser

- Navigate to https://reqbin.com/  
- Insert ec2-18-188-63-218.us-east-2.compute.amazonaws.com/users/createUser as the url
- Specify POST as the method
- Insert {"uid":502,"username":"John"} as the JSON body
- Click Send

##### In Dart (frontend language)
```
import 'package:http/http.dart' as http;

void main() async {
  // Define the URL you want to make the request to
  var url = Uri.parse('https://ec2-3-138-136-228.us-east-2.compute.amazonaws.com/users/createUser');

  // Define your JSON payload
  Map<String, dynamic> jsonBody = {
    'uid': 502,
    'username': 'John254'
  };

  // Convert the JSON payload to a string
  String jsonString = json.encode(jsonBody);

  // Make the POST request
  var response = await http.post(
    url,
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonString,
  );
}
```

The request will return a response that has a status code and a message, which can be references as _response.statusCode_ and _response.message_, which will also vary depending on the endpoint, method, and input JSON body.

```
    print(response.statusCode) 
    //returns 200
    
    print(response.message) 
    //returns "user with UID 502 created"
```

#### Users

_selecting users_: Used to select all users matching input JSON body and return an array of each of those users' attributes.
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :---: |  :------------------: | :---------------: |
| _ec2Host/users/selectUser_ | _get_ | _JSON body of following_ | _optional or required_ | _200_ | _array of JSON bodies of following_ |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| uid int | optional || uid int
||| email string | optional || email string
||| username string | optional || username string
||| bio string | optional || bio string
||| pfplink linkToImg | optional || pfplink linkToImg
||| superUser boolean | optional || superUser boolean
||| locationPerm boolean | optional || locationPerm boolean
||| notificationPerm boolean | optional || notificationPerm boolean
||| colorBlindRating int | optional || colorBlindRating int


_creating users_: Used to create user with attributes matching the input JSON body.
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :-------------: | :------------------: | :---------------: |
| _ec2Host/users/createUser_ | _post_ | _JSON body of following_ | _optional or required_ | _200_ | string |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| uid int | requried || user with uid ${testInput.uid} created
||| email string | optional || _or_
||| username string | optional || error message
||| bio string | optional || 
||| pfplink linkToImg | optional || 
||| superUser boolean | optional || 
||| locationPerm boolean | optional || 
||| notificationPerm boolean | optional || 
||| colorBlindRating int | optional || 

_updating users_: Used to update user with given UID so the match the input JSON body.
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :-------------: | :------------------: | :---------------: |
| _ec2Host/users/updateUserByUID_ | _put_ | _JSON body of following_ | _optional or required_ | _200_ | string |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| uid int | requried || user with uid ${testInput.uid} updated
||| email string | optional || _or_
||| username string | optional || error message
||| bio string | optional || 
||| pfplink linkToImg | optional || 
||| superUser boolean | optional || 
||| locationPerm boolean | optional || 
||| notificationPerm boolean | optional || 
||| colorBlindRating int | optional || 

_deleting users_: Used to delete user with given UID.
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/users/deleteUserByUID_ | _delete_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| uid int | requried || user with uid ${testInput.uid} deleted if existed
|||||| _or_
|||||| error message



#### Posts

We're working on this.



### Important bugs / not yet implemented features
 - pfpLink is not an image just yet, just a string since we will probably implement this as a link later. Right now it is just a string
 - You have to supply a UID when creating the user. Please just select a large enough random number. Later, we'll set up cognito to work this out.
