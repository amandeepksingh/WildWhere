import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
//import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:wildwhere/data.dart';
import 'package:wildwhere/map_preferences.dart';
import 'package:wildwhere/profile.dart';
import 'package:wildwhere/report.dart';
import 'package:wildwhere/settings.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mapbox_gl/mapbox_gl.dart';
import 'dart:typed_data';
import 'package:flutter/services.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapState();
}

class _MapState extends State<MapScreen> {
  MapboxMapController? _controller;
  Symbol? selectedSymbol;
  Offset? symbolWidgetPosition;
  
   @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  void _onMapCreated(MapboxMapController controller) {
    _controller = controller;
    controller.onSymbolTapped.add(_onSymbolTapped);
    controller.addListener(_onCameraMove);
  }

void _onStyleLoaded() async {
   await addImageFromAsset("assetImage", "assets/images/markericon.png");
   addMarker("marker1", 42.382418, -72.519032, "assetImage");
   addMarker("marker2", 42.395944, -72.524378, "assetImage");
  }


Future<void> addImageFromAsset(String name, String assetName) async {
    final ByteData bytes = await rootBundle.load(assetName);
    final Uint8List list = bytes.buffer.asUint8List();
    await _controller?.addImage(name, list);
  }

void addMarker(String id, double latitude, double longitude, String iconImageId) {
    _controller?.addSymbol(
      SymbolOptions(
        geometry: LatLng(latitude, longitude),
        iconImage: iconImageId,
        iconSize: 2.5,
      ),
    );
  }

void _onSymbolTapped(Symbol symbol) {
    setState(() {
      selectedSymbol = symbol;
      _updateSymbolPosition();
    });
  }
void _onCameraMove() {
    if (_controller != null && selectedSymbol != null) {
      _updateSymbolPosition();
    }
  }


void _updateSymbolPosition() async {
    if (selectedSymbol == null || _controller == null) return;
    var screenLocation = await _controller!.toScreenLocation(selectedSymbol!.options.geometry!);
    setState(() {
      symbolWidgetPosition = Offset(screenLocation.x - 100, screenLocation.y - 125);
    });
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
        MapboxMap(
          //styleString: "mapbox://styles/mberezuns/clv04vk35010701pk5pat427l",
          accessToken: "your-mapbox-access-token",
          onMapCreated: _onMapCreated,
          onStyleLoadedCallback: _onStyleLoaded,
          trackCameraPosition: true,
          initialCameraPosition: const CameraPosition(
            target: LatLng(42.381030, -72.529010),
            zoom: 12,
          ),
          onMapClick: (point, latLng) {
            setState(() {
              selectedSymbol = null;
              symbolWidgetPosition = null;
            });
          },
        ),
        if (symbolWidgetPosition != null) Positioned(
          left: symbolWidgetPosition!.dx,
          top: symbolWidgetPosition!.dy,
          child: _buildInfoBox(),
        )
      ],
    ),
    floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    floatingActionButton: FloatingActionButton.large(
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
            onPressed: () => currentLocation(_controller),
            shape: const CircleBorder(),
            elevation: 2,
            backgroundColor: const Color.fromARGB(255, 255, 255, 255),
            child: const Icon(Icons.my_location),
          ),
          const SizedBox(height: 10),
          FloatingActionButton(
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

  Widget _buildInfoBox() {
    return Container(
      width: 200,
      height: 100,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [BoxShadow( color: Colors.black26, offset: Offset(0, 2),)],
      ),
      child: Text(selectedSymbol != null ? "Details about the marker ${selectedSymbol!.id}" : "Tap a marker"),
    );
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

