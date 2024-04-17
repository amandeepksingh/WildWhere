class Post {
  final String uid;
  final String datetime;
  final Map<String,dynamic> coordinate;
  final String? animalName;
  final int quantity;
  final String activity;
  final String? imgLink;

  Post({
    required this.uid,
    required this.datetime,
    required this.coordinate,
    this.animalName,
    required this.quantity,
    required this.activity,
    this.imgLink,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      uid: json['uid'],
      datetime: json['datetime'],
      coordinate: json['coordinate'],
      animalName: json['animalname'],
      quantity: json['quantity'] as int,
      activity: json['activity'],
      imgLink: json['imglink']
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'datetime': datetime,
      'coordinate': coordinate,
      'animalname': animalName,
      'quantity': quantity,
      'activity': activity,
      'imglink': imgLink,
    };
  }
}

