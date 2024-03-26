import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:wildwhere/data.dart';
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

  //centers the map on Amherst, MA
  final LatLng _center = const LatLng(42.381030, -72.529010);

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  @override
  Widget build(BuildContext context) {
    var overlayController = OverlayPortalController();
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
        body: GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _center,
              zoom: 11.0,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomGesturesEnabled: true,
            zoomControlsEnabled: true,
            padding: const EdgeInsets.fromLTRB(0, 0, 10, 20)),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        floatingActionButton: FloatingActionButton.large(
          onPressed: overlayController.toggle,
          elevation: 10,
          
          shape: const CircleBorder(),
          backgroundColor: const Color.fromARGB(255, 255, 255, 255),
          child: OverlayPortal(
            controller: overlayController,
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
          child: Column(children: <Widget>[
            FloatingActionButton(
              onPressed: () => currentLocation(mapController),
              shape: const CircleBorder(),
              elevation: 2,
              backgroundColor: const Color.fromARGB(255, 255, 255, 255),
              child: const Icon(Icons.my_location),
            ),
            const SizedBox(height: 10),
            FloatingActionButton(
              onPressed: () => {},
              shape: const CircleBorder(),
              elevation: 2,
              backgroundColor: const Color.fromARGB(255, 255, 255, 255),
              child: const Icon(Icons.layers_outlined),
            )
          ]))
    ]);
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
