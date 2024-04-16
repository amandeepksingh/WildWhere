import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:wildwhere/data.dart';
import 'package:wildwhere/map_preferences.dart';
import 'package:wildwhere/profile.dart';
import 'package:wildwhere/report.dart';
import 'package:wildwhere/settings.dart';
import 'package:geolocator/geolocator.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapState();
}

class _MapState extends State<MapScreen> {
  late GoogleMapController mapController;
  final Set<Marker> _markers = {}; //makes set of markers
  Set<String> _tappedMarkerIds = {};
  CameraPosition _currentCameraPosition = CameraPosition(
    target: const LatLng(42.381030, -72.529010),
    zoom: 12.0,
  );

  bool _isCameraMoving = false;
  Future<void> _addMarker(String markerId, LatLng position) async { //method to add marker
  final icon = await BitmapDescriptor.fromAssetImage(
    const ImageConfiguration(),
    'assets/images/markericon.png',
  );

  setState(() {
    _markers.add(
      Marker(
        markerId: MarkerId(markerId),
        position: position,
        onTap: () {
          _tappedMarkerIds.add(markerId);
        },
        icon: icon,
      ),
    );
  });
}

void _removeMarker(String markerId) { //method to remove marker
  setState(() {
    _markers.removeWhere((marker) => marker.markerId.value == markerId);
    _tappedMarkerIds.remove(markerId);
  });
}


Future<void> _onMapCreated(GoogleMapController controller) async {
  mapController = controller;
}

Future<void> _fetchDataFromDatabase() async {
    try {
      var url = Uri.parse(
        'http://ec2-13-58-233-86.us-east-2.compute.amazonaws.com:80/posts/selectPost?pid=1 ');
      var response = await http.get(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      final double lat = data['message'][0]['coordinate']['y'];
      final double long = data['message'][0]['coordinate']['x'];
      LatLng positionFromDB = LatLng(lat, long);
      _addMarker('Marker from Database', positionFromDB);
    } else {
      throw Exception('Error accessing post from database!');
    } 
    } catch (e) {
        throw Exception(e);
    }
}

@override
void initState() {
  super.initState();
  _fetchDataFromDatabase();
  _addMarker('marker1', const LatLng(42.381830, -72.519714));
  _addMarker('marker2', const LatLng(42.389561, -72.503375));
}


@override
Widget build(BuildContext context) {
  var reportOverlayControl = OverlayPortalController();
  var prefOverlayControl = OverlayPortalController();
  return Stack(children: <Widget>[
    Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 2,
        title: const Text('Sightings'),
        actions: [
          PopupMenuButton(
            onSelected: (item) => onSelected(context, item),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 0, child: Text('Profile')),
              const PopupMenuItem(value: 1, child: Text('Settings')),
              const PopupMenuItem(value: 2, child: Text('Data & Statistics')),
            ],
            icon: const Icon(Icons.reorder),
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: _currentCameraPosition,
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomGesturesEnabled: true,
            zoomControlsEnabled: true,
            padding: const EdgeInsets.fromLTRB(0, 0, 10, 20),
            onTap: (LatLng position) {
              setState(() {
                _tappedMarkerIds.clear();
              });
            },
            onCameraMove: (CameraPosition position) {
              setState(() {
                _currentCameraPosition = position;
                _isCameraMoving = true;
              });
            },
            onCameraIdle: (){
              setState(() {
                _isCameraMoving = false;
              });
            },
          ),
          if(!_isCameraMoving)
          for (var markerId in _tappedMarkerIds)
            Builder(
              builder: (context) {
                final marker = _markers.firstWhere(
                  (m) => m.markerId.value == markerId,
                  orElse: () => throw Exception('Marker not found'),
                );
                final markerPosition = marker.position;
                final markerScreenPosition = _getMarkerScreenPosition(markerPosition);

                return Positioned(
                  left: markerScreenPosition.dx - 100,
                  top: markerScreenPosition.dy - 235,
                  child: Container(
                  width: 200,
                  height: 150,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'Custom Marker: $markerId',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    ),
    floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    floatingActionButton: FloatingActionButton.large(
        heroTag: "reportPage",
        onPressed: reportOverlayControl.toggle,
        elevation: 10,
        shape: const CircleBorder(),
        backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        child: OverlayPortal(
          controller: reportOverlayControl,
          overlayChildBuilder: (BuildContext context) {
            return const ReportPage();
          },
          child: const Icon(Icons.add_location_alt_outlined),
        ),
      ),
    ),
    Positioned(
      bottom: 30,
      right: 20,
      child: Column(
        children: <Widget>[
          FloatingActionButton(
            heroTag: "centerLocation",
            onPressed: () => currentLocation(mapController),
            shape: const CircleBorder(),
            elevation: 2,
            backgroundColor: const Color.fromARGB(255, 255, 255, 255),
            child: const Icon(Icons.my_location),
          ),
          const SizedBox(height: 10),
          FloatingActionButton(
            heroTag: "mapPref",
            onPressed: prefOverlayControl.toggle,
            shape: const CircleBorder(),
            elevation: 2,
            backgroundColor: const Color.fromARGB(255, 255, 255, 255),
            child: OverlayPortal(
              controller: prefOverlayControl,
              overlayChildBuilder: (BuildContext context) {
                return const MapPreferences();
              },
              child: const Icon(Icons.layers_outlined),
            ),
          ),
        ],
      ),
    ),
  ]);
  }

  Offset _getMarkerScreenPosition(LatLng markerPosition) {
      final width = MediaQuery.of(context).size.width;
      final height = MediaQuery.of(context).size.height;
      final centerLatLng = _currentCameraPosition.target;
      final zoom = _currentCameraPosition.zoom;
      final scale = math.pow(2, zoom).toDouble();
      final centerPoint = _latLngToOffset(centerLatLng, scale);
      final markerPoint = _latLngToOffset(markerPosition, scale);
      final translateX = (markerPoint.dx - centerPoint.dx) * scale;
      final translateY = (markerPoint.dy - centerPoint.dy) * scale;
      return Offset(width / 2 + translateX, height / 2 + translateY);
  }

  Offset _latLngToOffset(LatLng latLng, double scale) {
      final x = (latLng.longitude + 180) / 360 * scale;
      final y = (1 - math.log(math.tan(latLng.latitude * math.pi / 180) + 1 / math.cos(latLng.latitude * math.pi / 180)) / math.pi) / 2 * scale;
      return Offset(x, y);
  }
  
}

//Handles drop-down selection navigation
void onSelected(BuildContext context, int item) {
  switch (item) {
    case 0:
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => const Profile()));
      break;

    case 1:
      Navigator.push(context,
          MaterialPageRoute(builder: (context) => const SettingsPage()));
      break;

    case 2:
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => const Data()));
      break;
  }
}

void currentLocation(var controller) async {
  bool serviceEnabled;
  LocationPermission permission;
  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    throw Exception('Location service are disabled!');
  }
  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      throw Exception('Location permissions are denied!');
    }
  }
  if (permission == LocationPermission.deniedForever) {
    throw Exception(
        'Location permissions are permanently denied, we cannot request permissions.');
  }
  Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high);
  controller.animateCamera(
    CameraUpdate.newCameraPosition(
      CameraPosition(
        bearing: 0,
        target: LatLng(position.latitude, position.longitude),
        zoom: 17.0,
      ),
    ),
  );
}
