class Post {
  final String? pid;
  final String uid;
  final String datetime;
  final Map<String,dynamic> coordinate;
  final String? animalName;
  final int quantity;
  final String activity;
  final String? imgLink;

  Post({
    this.pid,
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
      pid: json['pid'],
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
    String formattedCoordinate = '(${coordinate['x']}, ${coordinate['y']})';
    return {
      'pid': pid,
      'uid': uid,
      'datetime': datetime,
      'coordinate': formattedCoordinate,
      'animalName': animalName,
      'quantity': quantity.toString(),
      'activity': activity,
      'imglink': imgLink,
    };
  }
}

