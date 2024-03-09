Accepted body objects:  
post: 
```  
{  
    author: string (must exist in users(username)),  
    species: string,  
    quantity: int/number,  
    comments: string,  
    dt: timestamp/_, 
    coordinate: point/_
}
```  
TODO - still working out what json datatypes correspond to the sql datatypes for timestamp and coordinate

user: 
```  
{  
    username: string (must be unique),  
    email: string,
    radius: int/number,
    notify: boolean,
    bio: string
}  
```  

Accepted endpoints with corresponding body parts => responses:  
posts: ```POST posts/add with body=post => returns {status = 200, post} on success, {status = 400, error} on fail```  
users: ```POST users/add with body=user => returns {status = 200, user} on success, {status = 400, error} on fail```  
dbTesting (temporary and dangerous): ```GET dbTesting/query with body=user => return {status = 200, queryResp} on success, {status = 400, error} on fail```  