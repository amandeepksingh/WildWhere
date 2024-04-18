import 'dart:async';
import 'package:flutter/material.dart';
import 'package:wildwhere/data.dart';
import 'package:wildwhere/profile.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/report.dart';
import 'package:wildwhere/settings.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mapbox_gl/mapbox_gl.dart';
import 'package:flutter/services.dart';
import 'package:wildwhere/postslistpage.dart';
import 'package:wildwhere/post.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapState();
}

class _MapState extends State<MapScreen> {
  MapboxMapController? _controller; // Controller to manage Mapbox map interaction.
  Symbol? selectedSymbol; // Holds the currently selected map symbol, if any.
  Offset? symbolWidgetPosition;  // Stores the position of the pop-up info box relative to the map view.
  Map<String, dynamic> symbolDataMap = {}; // Maps each symbol's ID to its data for quick retrieval.
  Map<String, dynamic>? currentPostData; // Data for the currently selected symbol.
  Future<Position>? position;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _controller?.dispose(); // Clean up the controller when the widget is removed from the widget tree.
    super.dispose();
  }

  void _onMapCreated(MapboxMapController controller) { // Callback function when the map is created and ready.
    _controller = controller;
    controller.onSymbolTapped.add(_onSymbolTapped);
    controller.addListener(_onCameraMove);
    addImageFromAsset("assetImage", "assets/images/markericon.png");
  }

  void _onStyleLoaded() async {  // Called when map style is fully loaded; we typically use this to add markers dynamically.
    _loadMarkers();
  }

  Future<void> addImageFromAsset(String name, String assetName) async { // Helper function to add a custom image asset to be used as a map marker icon.
    final ByteData bytes = await rootBundle.load(assetName);
    final Uint8List list = bytes.buffer.asUint8List();
    await _controller?.addImage(name, list);
  }

  void _loadMarkers() async { // Load markers from a data source and add them to the map.
    try {
      List<Post> posts = await Database().getAllPosts();
      for (Post post in posts) {
        _addMarker(post.pid!, post.coordinate['y'] as double,
            post.coordinate['x'] as double,
            post: post);
      }
    } catch (e) {
      print("Failed to load posts: $e");
    }
  }

  void _addMarker(String id, double latitude, double longitude, {Post? post}) { // Adds a single marker to the map.
    _controller
        ?.addSymbol(
      SymbolOptions(
        geometry: LatLng(latitude, longitude),
        iconImage: "assetImage",
        iconSize: 2.5,
      ),
    )
        .then((symbol) {
      // Storing post data in the map
      if (post != null) {
        symbolDataMap[symbol.id] = post.toJson();
      }
    });
  }

  void _onSymbolTapped(Symbol symbol) { // Handles user taps on map symbols (markers).
    setState(() {
      selectedSymbol = symbol;
      _updateSymbolPosition();
      // Fetch detailed information from the map using symbol ID
      currentPostData = symbolDataMap[symbol.id];
    });
  }

  void _onCameraMove() { // Refresh symbol position on camera (map view) move.
    if (_controller != null && selectedSymbol != null) {
      _updateSymbolPosition();
    }
  }

  void _updateSymbolPosition() async { // Update the position of the information box relative to the selected symbol.
    if (selectedSymbol == null || _controller == null) return;
    var screenLocation =
        await _controller!.toScreenLocation(selectedSymbol!.options.geometry!);
    setState(() {
      symbolWidgetPosition =
          Offset(screenLocation.x - 100, screenLocation.y - 125);
    });
  }

  @override
  Widget build(BuildContext context) {
    var reportOverlayControl = OverlayPortalController();
    //var prefOverlayControl = OverlayPortalController();
    return Stack(children: <Widget>[
      Scaffold(
        appBar: AppBar(
          backgroundColor: const Color.fromARGB(255, 255, 255, 255),
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
              styleString:
                  "mapbox://styles/mberezuns/clv1ba4fz019m01p61mdggons",
              accessToken:
                  "pk.eyJ1IjoibWJlcmV6dW5zIiwiYSI6ImNsdjA1MTk0djFlcDIybG14bHNtem1xeGEifQ.Xcg2SVacZ2TjY0zcKVKTig",
              myLocationEnabled: true,
              myLocationRenderMode: MyLocationRenderMode.NORMAL,
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
            if (symbolWidgetPosition != null)
              Positioned(
                left: symbolWidgetPosition!.dx,
                top: symbolWidgetPosition!.dy,
                child: _buildInfoBox(),
              ),
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
              onPressed: _navigateToPostsPage,
              shape: const CircleBorder(),
              elevation: 2,
              backgroundColor: const Color.fromARGB(255, 255, 255, 255),
              child: const Icon(Icons.list),
              )
            /*FloatingActionButton(
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
            */
          ],
        ),
      ),
    ]);
  }

  void _navigateToPostsPage() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PostsListPage()),
    );
  }

  Widget _buildInfoBox() { // Generates informational box widget for currently selected marker.
    if (selectedSymbol == null || currentPostData == null) {
      return const SizedBox
          .shrink(); // Return an empty container if no symbol is selected
    }

    Map<String, dynamic> data = currentPostData!;
    String infoText = "PID: ${data['pid']}\n"
        "Animal: ${data['animalName']}\n"
        "Activity: ${data['activity']}\n"
        "Quantity: ${data['quantity']}\n";

    return Container(
    width: 275,
    height: 100,
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(10),
      boxShadow: const [BoxShadow(color: Colors.black26, offset: Offset(0, 2))]
    ),
    child: Row(
      children: [
        // Image Container
        Expanded(
          flex: 1,  // takes 1/2 of the space
          child: Image.network(
            data['imgLink'] ?? 'https://via.placeholder.com/150',  // Placeholder if no imgLink is available
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              // Fallback for when the image fails to load
              return Icon(Icons.image_not_supported);
            }
          ),
        ),
        
        // Text Container
        Expanded(
          flex: 1,  // takes 1/2 of the space
          child: Container(
            padding: EdgeInsets.only(left: 10), 
            alignment: Alignment.centerLeft,  
            child: Text(
              infoText,
              style: TextStyle(fontSize: 12),  //adjust text styling here
              overflow: TextOverflow.ellipsis,  // Prevents overflow by using ellipsis
              maxLines: 5,  
            ),
          ),
        )
      ],
    ),
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
