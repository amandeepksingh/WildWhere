class Post {
  final String uid;
  final String datetime;
  final String coordinate;
  final String animalName;
  final String quantity;
  final String activity;
  final String? imgLink;

  Post({
    required this.uid,
    required this.datetime,
    required this.coordinate,
    required this.animalName,
    required this.quantity,
    required this.activity,
    this.imgLink,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      uid: json['uid'],
      datetime: json['datetime'],
      coordinate: json['coordinate'],
      animalName: json['animal'],
      quantity: json['quantity'],
      activity: json['activity'],
      imgLink: json['imgLink']
    );
  }
}