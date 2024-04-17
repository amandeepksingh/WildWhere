class User {
  final String uid;
  final String? email;
  final String? username;
  final String? bio;
  final bool? superUser;
  final String? imgLink;
  
  
  User({
    required this.uid,
    this.email,
    this.username,
    this.bio,
    this.superUser,
    this.imgLink,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      uid: json['uid'],
      email: json['email'],
      username: json['username'],
      bio: json['bio'],
      superUser: json['superUser'],
      imgLink: json['imglink']
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'username': username,
      'bio': bio,
      'superUser': superUser,
      'imglink': imgLink,
    };
  }
}
