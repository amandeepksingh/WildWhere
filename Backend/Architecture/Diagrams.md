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
Users <|-- Query : Get
Users <|-- Update : Put
Users <|-- Delete : Delete

Create : username - string [required, unique],  
Create : email - string [optional],
Create : radius - int/number [optional],
Create : notify - boolean [optional],
Create : bio - string [optional]

Query : condition - string [optional],
Query : limit - int [optional]

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
Posts : dt - string [optional],
Posts : coordinates - [float,float] [optional]

Posts <|-- Create : Post
Posts <|-- Query : Get
Posts <|-- Update : Put
Posts <|-- Delete : Delete

Create : author - string [required, must exist in users[username]], 
Create : species - string [optional],
Create : quantity - int/number [optional],
Create : comments - string [optional],
Create : dt - string [optional],
Create : coordinates - [float,float] [optional]

Query : condition - string [optional],
Query : limit - int [optional]

Update : condition - string [optional]
Update : updates - [[string, string]] [optional]

Delete : condition - string [optional]
```
Notes:  
dt format is "YYYY-MM-DD HH:MM:SS"  
coordinate format is [latitude,longitude]
updates format is [[field1,newVal1], [field2,newVal2] ... [fieldN,newValN]]

#### HOW TO USE
 - Use endpoint from: host/posts, host/users
 - Use method from: POST, GET, PUT, DELETE
 - Use JSON body with names and types that correspond to the selected endpoint and method
