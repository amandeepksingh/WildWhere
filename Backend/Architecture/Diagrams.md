# Diagrams

### AWS 
```mermaid
flowchart TD
    External--> Cognito --> EC2
    EC2 --> RDS
    EC2 --> S3
```



### Requests Chain
```mermaid
flowchart TD
    External
    -->server
    -->app
    -->router;
    
    router-->posts;
    router-->users;
    

```

### Endpoints
#### Users
```mermaid
classDiagram
Users : username - string [required, unique],  
Users : email - string [optional],
Users : radius - int/number [optional],
Users : notify - boolean [optional],
Users : bio - string [optional]

Users <|-- Create : Post
Users <|-- Read : Get
Users <|-- Update : Put
Users <|-- Delete : Delete

Create : username - string [required, unique],  
Create : email - string [optional],
Create : radius - int/number [optional],
Create : notify - boolean [optional],
Create : bio - string [optional]

Read : condition - string [optional],
Read : limit - int [optional]

Update : condition - string [optional]
Update : updates - [[string, string]] [optional]

Delete : condition - string [optional]
```

#### Posts

```mermaid
classDiagram
Posts : author - string [required, references users[username]], 
Posts : species - string [optional],
Posts : quantity - int/number [optional],
Posts : comments - string [optional],
Posts : dt - timestamp/string [optional],
Posts : coordinates - point/[float,float] [optional]
Posts : image - href/string [optional]

Posts <|-- Create : Post
Posts <|-- Read : Get
Posts <|-- Update : Put
Posts <|-- Delete : Delete

Create : author - string [required, must exist in users[username]], 
Create : species - string [optional],
Create : quantity - int/number [optional],
Create : comments - string [optional],
Create : dt - timestamp/string [optional],
Create : coordinates - point/[float,float] [optional]
Create : image - href/string [optional]

Read : condition - string [optional],
Read : limit - int [optional]

Update : condition - string [optional]
Update : updates - [[string, string]] [optional]

Delete : condition - string [optional]
```
Notes:  
dt format is "YYYY-MM-DD HH:MM:SS"  
coordinate format is [latitude,longitude]
updates format is [[field1,newVal1], [field2,newVal2] ... [fieldN,newValN]]

### ER Diagram
```mermaid
erDiagram
    Users {
        username string PK "required, unique"
        email string "optional"  
        radius int "optional"  
        notify boolean "optional"
        bio string "optional"
    }

    Posts {
        author string FK "required, references users(username)" 
        species string "optional"
        quantity int "optional"
        comments string "optional"
        dt timestamp "optional"
        coordinates point "optional"        
        image href "optional"
    }

    Users ||--o{ Posts : "Exactly one - 0 or many"
```


#### HOW TO USE
 - Use endpoint from: host/posts, host/users
 - Use method from: Create/POST, Read/GET, Update/PUT, Delete/DELETE
 - Use JSON body with names and types that correspond to the selected endpoint and method

#### Examples

To create a user:
 - Endpoint = host/users
 - Method = Create/Post
 - JSON body = 
 ```
{
    username - string [required, unique],  
    email - string [optional],
    radius - int/number [optional],
    notify - boolean [optional],
    bio - string [optional]
}
```
 - Example body = 
  ```
  {
    "username": "jonahia",
    "email": "jdoe@umass.edu",
    "radius": 50,
    "notify": true,
    "bio": "I like birds"
  }
  ```
 - Example shown through Postman API:
  ![alt text](images/exampleQuery.png)

To read a user:
 - Endpoint = host/users
 - Method = Read/Get
 - JSON body = 
 ```
 {
    "condition" = ""
 }
 ```
 - Example body = ```{}```
 - Example shown through Postman API:
 ![alt text](images/exampleQuery2.png)