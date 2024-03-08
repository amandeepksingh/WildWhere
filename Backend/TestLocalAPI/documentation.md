Accepted body objects:
user = {"name": "john doe", "email": "jdoe@umass.edu", "radius": 100, "notification": false, "bio": "i like birds"}
post = {"author": "john doe", "image": "deadLink", "species": "tiger", "count": 150, "additionalComments": "none", "datetime": "12pm", "coordinate": "150N, 120S"} //TODO clarify form for image, datetime, and coordinate

Accepted endpoints with corresponding body parts => responses:
    posts
        POST posts/add with body=post => returns {status = 200, post} on success
    users
        POST users/add with body=user => returns {status = 200, user} on success