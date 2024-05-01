# WildWhere

## Webpage: https://sites.google.com/umass.edu/wildwhere/home

## Frontend

### Build Process

#### Introduction

This README provides instructions on how to find the WildWhere project’s build system, check out its source files, and build them. Please note that these instructions pertain to the frontend.

#### Build System Setup

1. ##### Prerequisities
      - In order to successfully run the project, the following tools need to be installed:
         - Install Flutter & OS Specific IDE: https://docs.flutter.dev/get-started/install
            - Select your development platform
            - If your platform is macOS, choose iOS; If your platform is Windows, choose Android
            - Follow the corresponding installation steps to download the Flutter SDK
              - Important (MacOS): Ensure you have added Flutter to the PATH environment variable in order to use Flutter commands in                   the Terminal https://www.codecademy.com/article/install-flutter-sdk-for-mac
              - Important (Windows): Ensure you have added Flutter to the PATH environment variable in order to use Flutter commands
                 in the Terminal https://www.liquidweb.com/kb/how-to-install-and-configure-flutter-sdk-windows-10/ (step 3)
      - Check your development setup by running the “flutter doctor” command in your terminal. You do not need both development kits            for both operating systems. For example, this is a valid output for MacOS:
        
         ![alt text](https://github.com/amandeepksingh/WildWhere/blob/main/frontend/wildwhere/assets/images/sc1.png)
   
3. ##### Clone the Github Repository

4. ##### Build and Run the Application
   
      - Using your terminal, cd into “/Wildwhere-main/frontend/wildwhere”
      - Begin a simulator either through XCode or AndroidStudio
      - Run “flutter devices” and copy the device id of the simulator
      - Run “flutter run -d DEVICEID” to build and run the application
      - Example build and run process on MacOS using XCode simulator:
   
         ![alt text](https://github.com/amandeepksingh/WildWhere/blob/main/frontend/wildwhere/assets/images/sc2.png)

### Testing

- Clone the GitHub repository and save the project to your preferred folder.
- For VSCode:
  - Open the `database_test.dart` file.
  - Go to Run > Start Debugging. You can also press the appropriate keyboard shortcut for your platform.
- To run tests in the terminal:
  - Run the following command from the root of the project: `flutter test test/database_test.dart`

 
  

## Backend

### Backend Onboarding
- install git: https://git-scm.com/downloads and follow the instructions to download'
- go to an intended folder to place a repository, open the a shell and run ``` git clone https://github.com/amandeepksingh/WildWhere.git``` make sure you are logged in and have the necessary permissions.
- run ```git log``` to see commit history (make sure you can see them and that they match to the commit numbers) then also run ```git branch -r``` to make sure you have cloned the repository and see all remote branches
- run ```git branch -c main <your_onboarding_branch>``` to copy the main branch and make your own branch
- run ```git switch <your_onboarding_branch>``` to switch to the branch you made
- because your branch is not on the remote repository run ``` git push -u origin <your_onboarding_branch>``` to push to the remote and set the upstream branch, check to make sure that after it is successful that you can see your branch on the repository.
- switch directories to the /WILDWHERE/backend
- install nvm via the node version manager github repo: https://github.com/nvm-sh/nvm
- once it is installed run ``` nvm install node ```
- then install the required dependencies by running ```npm install --save```
- You can now run the scripts indicated in the package.json such as ```npm run start ```
- Edit and have fun! When you are done, ```git status``` will list changed files ```git commit -a``` will automatically stage and commit all changes. If you choose to only commit certain files ```git add <file>``` will stage the file for commit, you must manually write ```git commit``` to commit, write a commit message save the file and quit. To push to remote run ```git push```. <b>MAKE SURE</b> you do not have any aws secrets.
 - if you need to work on something else and the work is not complete you do not need to commit. Instead you may stash the changes to save for later by using ```git stash```. To reapply the changes run ```git stash apply```. To get rid of them ```git stash drop```
- when you are done with the branch you can either submit a pull request, which will require review, or you can delete the branch
  - to submit a pull request you must go through the github website
  - to delete branch, first switch to another branch by running ```git checkout <another-branch>``` then ```git branch -d <your_onboarding_branch>```(if it chooses not to delete you can use the ```-D``` flag instead of ```-d```), which will only delete the branch locally. To delete on the remote run ```git push origin --delete <another-branch>``` 

#### Naming conventions
Other than your onboarding branch we require that the branch name correlates to the feature name or release or problem you are trying to fix.

#### Merging to main
Unless special circumstances we NEVER edit and push directly on main. 

#### Server location
The code will automatically detect that you are running on local and will resolve the server to localhost(127.0.0.1).

#### Deploying to a server
Normally ask a network admin and they will build your changes to a development server. Moreover, if your changes are merged into main the server should automatically deploy to development by the end of the day. However, if you are given access to the pipeline:
- make sure your changes are merged to main, then manually build the pipeline. This will deploy to our development server. 
- Unless explicitly given permission, do not build to our production server

#### Testing
To run the tests, we require postgresql to be installed on your local computer. If postgresql is not installed on your machine, we refer you to the very thorough documentation included at https://www.postgresql.org/download/. After you've successfully confirmed that postgresql is working on your local machine, move forward with the following steps:
- please change the field 5th line of /WILDWHERE/.env to be the password associated with the user named postgres (this user is included in installation by default)
- log into psql
- create a database called wildwhere: run ```CREATE DATABASE Wildwhere;```
- connect to Wildwhere: run ```\c wildwhere;```
- add the necessary extensions: run ```CREATE EXTENSION IF NOT EXISTS cube;``` and ```CREATE EXTENSION IF NOT EXISTS earthdistance;```
- create the users table: run ```CREATE TABLE users (uid varchar(50) PRIMARY KEY, email VARCHAR(50), username VARCHAR(50), bio VARCHAR(50), imgLink VARCHAR(5000), superUser BOOLEAN, locationPerm BOOLEAN, notificationPerm BOOLEAN, colorBlindRating INTEGER);```
- create the posts table: run ```CREATE TABLE posts (pid varchar(50) PRIMARY KEY, uid VARCHAR(128) NOT NULL REFERENCES users(uid) ON DELETE CASCADE, imgLink TEXT, datetime TIMESTAMP, coordinate POINT NOT NULL, animalName TEXT, quantity INTEGER, activity TEXT);```
- cd into the /WILDWHERE/backend directory
- run tests: ```npm test```
  - note that ```IMAGES: test user normal functionality```, ```IMAGES: test post normal functionality```, ```IMAGES: test user delete normal```, and ```IMAGES: test post delete normal``` require access to the s3 bucket to properly test. In the interest of security, we do not give these credentials to develops but have it stored in our aws instance so that these tests are run during build. As a result, these 4 tests will fail on the local run of ```npm test```


### Backend API

To run against the backend API, use the host listed for the EC2. This varies since it changes every time it's started up, but right now it is ec2-13-58-233-86.us-east-2.compute.amazonaws.com

You can add endpoints such as _/users/createUser_ onto the end to reach different endpoints the backend has set up. Each endpoint will support some method (_Post_, _Get_, _Put_, or _Delete_) and accept some input JSON body. These are specified below.

After sending a request to an endpoint with a method and input JSON body, you'll receive a response (most of the time. Unless we haven't hit that edge case yet).

#### Example

Then you could run a request to the endpoint _ec2Host/users/createUser_ that uses a _Post_ method and send _{uid: 582, username: John254}_ as its input JSON body.

##### In browser

- Navigate to https://reqbin.com/  
- Insert ec2-13-58-233-86.us-east-2.compute.amazonaws.com/users/createUser as the URL
- Specify POST as the method
- Insert {"username": "John"} as the JSON body
- Click Send

##### In Dart (frontend language)
```
import 'package:http/http.dart' as http;

void main() async {
  // Define the URL you want to request to
  var url = Uri.parse('http://ec2-3-138-136-228.us-east-2.compute.amazonaws.com/users/createUser');

  // Define your JSON payload
  Map<String, dynamic> jsonBody = {
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
    //returns "user created"
```

### Description

#### User Description

_selecting users_: Used to select all users matching input JSON body and return an array of each of those users' attributes.  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :---: |  :------------------: | :---------------: |
| _ec2Host/users/selectUser_ | _get_ | _JSON body of following_ | _optional or required_ | _200_ | _array of JSON bodies of following_ |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| uid string | optional || uid string
||| email string | optional || email string
||| username string | optional || username string
||| bio string | optional || bio string
||| imgLink string | optional || imgLink string
||| superUser boolean | optional || superUser boolean
||| locationPerm boolean | optional || locationPerm boolean
||| notificationPerm boolean | optional || notificationPerm boolean
||| colorBlindRating int | optional || colorBlindRating int

_creating users_: Used to create user with attributes matching the input JSON body.  
Requests accepted by JSON-body encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :-------------: | :------------------: | :---------------: |
| _ec2Host/users/createUser_ | _post_ | _JSON body of following_ | _optional or required_ | _200_ | string |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| uid string | REQUIRED || user created
||| email string | optional || _or_
||| username string | optional || error message
||| bio string | optional || 
||| imgLink string | optional || 
||| superUser boolean | optional || 
||| locationPerm boolean | optional || 
||| notificationPerm boolean | optional || 
||| colorBlindRating int | optional || 

_updating users_: Used to update user with given UID so the match the input JSON body.  
Requests accepted by JSON-body encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :-------------: | :------------------: | :---------------: |
| _ec2Host/users/updateUserByUID_ | _put_ | _JSON body of following_ | _optional or required_ | _200_ | string |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| uid string | REQUIRED || user with uid ${uid} updated
||| email string | optional || _or_
||| username string | optional || error message
||| bio string | optional || 
||| imgLink string | optional || 
||| superUser boolean | optional || 
||| locationPerm boolean | optional || 
||| notificationPerm boolean | optional || 
||| colorBlindRating int | optional || 

_deleting users_: Used to delete user with given UID.  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/users/deleteUserByUID_ | _delete_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| uid string | requried || user with uid ${uid} deleted if existed
|||||| _or_ 
|||||| error message



#### Post Description

_selecting posts_: Used to select all posts matching input JSON body and return an array of each of those posts' attributes.  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :---: |  :------------------: | :---------------: |
| _ec2Host/posts/selectPost_ | _get_ | _JSON body of following_ | _optional or required_ | _200_ | _array of JSON bodies of following_ |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| pid string | optional || pid string
||| uid string | optional || uid string
||| radius int | optional || radius int 
||| imgLink string | optional || imgLink string
||| starttime timestamp YYYY/MM/DD/HH24/MI/ss | optional || starttime timestamp
||| endtime timestamp YYYY/MM/DD/HH24/MI/ss | optional || endtime timestamp
||| coordinate point (longitude [-180, 180], latitude [-90, 90]) e.g. (-169.2, 25.0) | optional (required for non-null radius) || coordinate point
||| animalName string | optional || animalName string
||| quantity int | optional || quantity int
||| activity string | optional || activity string


_creating posts_: Used to create post with attributes matching the input JSON body.  
Requests accepted by JSON-body encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :-------------: | :------------------: | :---------------: |
| _ec2Host/posts/createPost_ | _post_ | _JSON body of following_ | _optional or required_ | _200_ | string |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| pid string | AUTO-GENERATED (random) || post created
||| uid string | REQUIRED || _or_
||| imgLink string | optional || error message
||| datetime timestamp YYYY-MM-DD HH:MM:SS | optional ||
||| coordinate point (longitude [-180, 180], latitude [-90, 90]) e.g. (-169.2, 25.0) | REQUIRED ||
||| animalName string | optional ||
||| quantity int | optional ||
||| activity string | optional ||

_updating posts_: Used to update post with given PID so the match the input JSON body.  
Requests accepted by JSON-body encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :-------------: | :------------------: | :---------------: |
| _ec2Host/posts/updatePostByPID_ | _put_ | _JSON body of following_ | _optional or required_ | _200_ | string |
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---: |
||| pid string | REQUIRED || post with pid ${pid} updated
||| uid string | optional || _or_
||| imgLink string | optional || error message
||| datetime timestamp | optional ||
||| coordinate point | optional ||
||| animalName string | optional ||
||| quantity int | optional ||
||| activity string | optional ||

_deleting posts_: Used to delete post with given PID.  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/posts/deletePostByPID_ | _delete_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| pid string | REQUIRED || user with pid ${pid} deleted if existed
|||||| _or_
|||||| error message

### Images

#### User Images

_uploading images_: Used to upload images  
Requests accepted by form-data encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/images/userProfilePic/upload_ | _post_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| uid int | REQUIRED || link to pfp
||| img image | REQUIRED || _or_
||| ||| error message


_deleting images_: Used to delete image (signed URLs become invalid)  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/images/userProfilePic/delete_ | _delete_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| uid int | REQUIRED || 'image delete successful'
|||||| _or_
|||||| error message

#### Post Images

_uploading images_: Used to upload images  
Requests accepted by form-data encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/images/postPic/upload_ | _post_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| pid int | REQUIRED || link to pfp
||| img image | REQUIRED || _or_
||| ||| error message


_deleting images_: Used to delete image (signed URLs become invalid)  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/images/postPic/delete_ | _delete_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| pid int | REQUIRED || 'image delete successful'
|||||| _or_
|||||| error message


### Reports

_selecting reports_: Used to select reports  
Requests accepted by URL-encoded query
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/images/reports/selectReport_ | _select_ | _JSON body of following_ | _optional or required_ | _200_ | array of JSON bodies of following
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| pid string | optional || pid string
||| uid string | optional || uid string
||| reason string | optional || reason string

_posting reports_: Used to create reports  
Requests accepted by JSON-body encoded request
| Endpoint | Method | Input JSON body | Input JSON Param optional/required | response status code | response message |  
| :-------: | :----: | :-------------: | :------------------: | :---------------: | :---------------: |
| _ec2Host/images/reports/createReport_ | _post_ | _JSON body of following_ | _optional or required_ | _200_ | string
| :-------: | :----: | :-------------: | :------------------: | :-------------: | :---------------: |
||| pid string | REQUIRED || "report created successfully"
||| uid string | REQUIRED || _or_
||| reason string | REQUIRED || error message

### Database infrastructure

Our PostgreSQL database is hosted on RDS as a part of the AWS suite. We use an EC2 to interact with it and the tables we use in the database are shown below: ![db schema diagram](Schema.png)
